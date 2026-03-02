import { useState } from 'react';
import '../styles/auth.css';

const AuthForm = ({ onSubmit, showName = false }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {showName && (
        <label>
          Name
          <input name="name" value={form.name} onChange={update} />
        </label>
      )}

      <label>
        Email
        <input name="email" type="email" value={form.email} onChange={update} />
      </label>

      <label>
        Password
        <input name="password" type="password" value={form.password} onChange={update} />
      </label>

      <button type="submit">Submit</button>
    </form>
  );
};

export default AuthForm;
