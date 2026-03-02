const db = require('../config/db.config');
const { uploadToDrive } = require('../utils/googleDrive');

exports.createDelegation = async (req, res) => {
  try {
    const {
      delegation_name,
      description,
      delegator_id,
      delegator_name,
      doer_id,
      doer_name,
      department,
      priority,
      due_date,
      evidence_required,
    } = req.body;

    // ---- File uploads ----
    let voice_note_url = "";
    let reference_docs = [];

    if (req.files?.voice_note) {
      const file = req.files.voice_note[0];
      voice_note_url = await uploadToDrive(file.buffer, file.originalname, file.mimetype);
    }

    if (req.files?.reference_docs) {
      reference_docs = await Promise.all(
        req.files.reference_docs.map(f =>
          uploadToDrive(f.buffer, f.originalname, f.mimetype)
        )
      );
    }

    const delegations = await db.getAll("delegation");
    const id = delegations.length + 1;

    const formattedDueDate = due_date
      ? `${due_date.includes("T") ? due_date : due_date + "T00:00"}:00+05:30`
      : null;

    const delegation = {
      id,
      delegation_name,
      description,
      delegator_id,
      delegator_name,
      doer_id,
      doer_name,
      department,
      priority,
      status: "NEED CLARITY",
      due_date: formattedDueDate,
      voice_note_url,
      reference_docs: JSON.stringify(reference_docs),
      evidence_required: evidence_required === true || evidence_required === "true",
      created_at: new Date().toISOString(),
      remarks: JSON.stringify([]),
      revision_history: JSON.stringify([]),
    };

    await db.insertByHeader("delegation", delegation);

    res.status(201).json({
      ...delegation,
      message: "Delegation created successfully",
    });
  } catch (err) {
    console.error("createDelegation error:", err);
    res.status(500).json({ message: "Error creating delegation" });
  }
};


// Get delegations with role-based filtering
exports.getDelegations = async (req, res) => {
  try {
    const { role } = req.user;
    const userId = req.user.id || req.user.User_Id;

    const delegations = await db.getAll("delegation");

    let result =
      role === "Admin" || role === "SuperAdmin"
        ? delegations
        : delegations.filter(
            d =>
              String(d.doer_id) === String(userId) ||
              String(d.delegator_id) === String(userId)
          );

    result.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching delegations" });
  }
};


// Add a remark to a delegation
exports.addRemark = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;
  const { id: user_id, email: username } = req.user;

  try {
    const remarks = await db.getAll("remark");
    const remarkId = remarks.length + 1;

    const remarkObj = {
      id: remarkId,
      delegation_id: Number(id),
      user_id,
      username,
      remark,
      created_at: new Date().toISOString(),
    };

    await db.insertByHeader("remark", remarkObj);

    res.status(201).json(remarkObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding remark" });
  }
};


// Get delegation details with remarks and history
exports.getDelegationDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const delegations = await db.getAll("delegation");
    const delegation = delegations.find(d => String(d.id) === String(id));

    if (!delegation) {
      return res.status(404).json({ message: "Delegation not found" });
    }

    const remarks = (await db.getAll("remark"))
      .filter(r => String(r.delegation_id) === String(id))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const history = (await db.getAll("revision_history"))
      .filter(h => String(h.delegation_id) === String(id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      ...delegation,
      remarks_detail: remarks,
      revision_history_detail: history,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching delegation detail" });
  }
};


// Update delegation
exports.updateDelegation = async (req, res) => {
  const { id } = req.params;
  const {
    delegation_name,
    description,
    doer_id,
    doer_name,
    department,
    priority,
    due_date,
    evidence_required,
    status,
    remark,
  } = req.body;

  try {
    // 1️⃣ Load existing delegation
    const delegations = await db.getAll("delegation");
    const delegation = delegations.find(d => String(d.id) === String(id));

    if (!delegation) {
      return res.status(404).json({ message: "Delegation not found" });
    }

    const oldDelegation = { ...delegation };

    // 2️⃣ Handle revision history (due_date change)
    if (due_date && delegation.due_date) {
      const newDate = new Date(due_date).getTime();
      const oldDate = new Date(delegation.due_date).getTime();

      if (newDate !== oldDate) {
        const revisions = await db.getAll("revision_history");

        await db.insertByHeader("revision_history", {
          id: revisions.length + 1,
          delegation_id: Number(id),
          old_due_date: delegation.due_date,
          new_due_date: due_date,
          old_status: delegation.status,
          new_status: status || delegation.status,
          reason: remark || `Status changed to ${delegation.status}`,
          changed_by: req.user.email,
          created_at: new Date().toISOString(),
        });
      }
    }

    // 3️⃣ Handle remark
    if (remark) {
      const remarks = await db.getAll("remark");
      await db.insertByHeader("remark", {
        id: remarks.length + 1,
        delegation_id: Number(id),
        user_id: req.user.id,
        username: req.user.email,
        remark,
        created_at: new Date().toISOString(),
      });
    }

    // 4️⃣ Handle file uploads
    let new_voice_note_url = delegation.voice_note_url || "";
    let new_reference_docs = delegation.reference_docs
      ? JSON.parse(delegation.reference_docs)
      : [];

    if (req.files?.voice_note) {
      try {
        const file = req.files.voice_note[0];
        new_voice_note_url = await uploadToDrive(
          file.buffer,
          file.originalname,
          file.mimetype
        );
      } catch (e) {
        console.warn("Voice upload failed:", e);
      }
    }

    if (req.files?.reference_docs) {
      const uploadedDocs = await Promise.all(
        req.files.reference_docs.map(async file => {
          try {
            return await uploadToDrive(
              file.buffer,
              file.originalname,
              file.mimetype
            );
          } catch {
            return null;
          }
        })
      );
      new_reference_docs.push(...uploadedDocs.filter(Boolean));
    }

    // 5️⃣ Format due date (IST)
    let formattedDueDate = delegation.due_date;
    if (due_date) {
      const dateStr = due_date.includes("T")
        ? due_date
        : `${due_date}T00:00`;
      formattedDueDate = `${dateStr}:00+05:30`;
    }

    // 6️⃣ Build updated delegation object
    const updatedDelegation = {
      ...delegation,
      delegation_name: delegation_name ?? delegation.delegation_name,
      description: description ?? delegation.description,
      doer_id: doer_id ?? delegation.doer_id,
      doer_name: doer_name ?? delegation.doer_name,
      department: department ?? delegation.department,
      priority: priority ?? delegation.priority,
      due_date: formattedDueDate,
      evidence_required:
        evidence_required !== undefined
          ? evidence_required === true || evidence_required === "true"
          : delegation.evidence_required,
      status: status ?? delegation.status,
      voice_note_url: new_voice_note_url,
      reference_docs: JSON.stringify(new_reference_docs),
      updated_at: new Date().toISOString(),
    };

    // 7️⃣ Update sheet
    await db.updateById("delegation", id, updatedDelegation);

    res.json(updatedDelegation);
  } catch (err) {
    console.error("Error updating delegation:", err);
    res.status(500).json({ message: "Error updating delegation" });
  }
};


// Delete delegation
exports.deleteDelegation = async (req, res) => {
  const { id } = req.params;

  try {
    await db.deleteById("delegation", id);
    res.json({ message: "Delegation deleted successfully", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting delegation" });
  }
};


// Stream audio from Google Drive
exports.streamAudio = async (req, res) => {
  const { fileId } = req.params;
  const { getFileStream } = require("../utils/googleDrive");

  try {
    const stream = await getFileStream(fileId);
    res.setHeader("Content-Type", "audio/webm");
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error streaming audio" });
  }
};

