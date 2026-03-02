import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import Loader from "../../components/common/Loader";
import {
  fetchTodos,
  updateTodoStatus,
  deleteTodo,
  moveTodoOptimistically,
} from "../../store/slices/todoSlice";
import MainLayout from "../../components/layout/MainLayout";
import CreateTodoModal from "../../components/todo/CreateTodoModal";
import TodoCard from "../../components/todo/TodoCard";
import toast from "react-hot-toast";

const COLUMNS = [
  { id: "To Do", title: "To Do", color: "border-t-slate-400" },
  { id: "In Progress", title: "In Progress", color: "border-t-blue-500" },
  { id: "Done", title: "Done", color: "border-t-green-500" },
];

const KanbanColumn = ({ id, title, color, todos, onDeleteTask }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col w-full min-w-[300px] h-full bg-bg-main/30 rounded-2xl border border-border-main p-4">
      <div
        className={`flex items-center justify-between mb-4 pb-2 border-t-4 ${color}`}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-text-main">{title}</h3>
          <span className="bg-bg-card border border-border-main text-[10px] font-bold px-2 py-0.5 rounded-full text-text-muted">
            {todos.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-3 min-h-[200px]"
      >
        <SortableContext
          items={todos.map((t) => t.todo_id)}
          strategy={verticalListSortingStrategy}
        >
          {todos.map((todo) => (
            <TodoCard key={todo.todo_id} todo={todo} onDelete={onDeleteTask} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

const ToDoBoard = () => {
  const dispatch = useDispatch();
  const { todos, isLoading } = useSelector((state) => state.todo);
  const [activeTodo, setActiveTodo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drags when clicking delete
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  React.useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  const handleDragStart = (event) => {
    const { active } = event;
    const todo = todos.find((t) => t.todo_id === active.id);
    setActiveTodo(todo);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTodo = todos.find((t) => t.todo_id === activeId);

    // Check if dropping over a column or another card
    let newStatus = overId;
    if (!COLUMNS.find((c) => c.id === overId)) {
      const overTodo = todos.find((t) => t.todo_id === overId);
      newStatus = overTodo ? overTodo.status : activeTodo.status;
    }

    if (activeTodo.status !== newStatus) {
      dispatch(moveTodoOptimistically({ id: activeId, newStatus }));
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Determine target status
    let newStatus = overId;
    if (!COLUMNS.find((c) => c.id === overId)) {
      const overTodo = todos.find((t) => t.todo_id === overId);
      newStatus = overTodo ? overTodo.status : activeTodo.status;
    }

    try {
      await dispatch(
        updateTodoStatus({ id: activeId, status: newStatus }),
      ).unwrap();
    } catch (err) {
      toast.error("Failed to sync status with server");
      dispatch(fetchTodos()); // Rollback on error
    }
  };

  const handleDeleteTask = (id) => {
    if (window.confirm("Delete this task?")) {
      dispatch(deleteTodo(id));
    }
  };

  return (
    <MainLayout title="ToDo Kanban">
      <div className="h-full flex flex-col p-4 space-y-4 overflow-hidden">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                view_kanban
              </span>
              Task Board
            </h2>
            <p className="text-xs text-text-muted">
              Drag cards to change status
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Task
          </button>
        </div>

        {isLoading && todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader className="w-48 h-48" />
            <p className="mt-2 text-text-muted font-bold text-sm">
              Loading Tado...
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-6 h-full min-w-max md:min-w-full">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                {COLUMNS.map((col) => (
                  <KanbanColumn
                    key={col.id}
                    id={col.id}
                    title={col.title}
                    color={col.color}
                    todos={todos.filter((t) => t.status === col.id)}
                    onDeleteTask={handleDeleteTask}
                  />
                ))}

                <DragOverlay>
                  {activeTodo ? (
                    <div className="w-[300px] shadow-2xl rotate-2">
                      <TodoCard todo={activeTodo} isPlaceholder />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        )}
      </div>

      <CreateTodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </MainLayout>
  );
};

export default ToDoBoard;
