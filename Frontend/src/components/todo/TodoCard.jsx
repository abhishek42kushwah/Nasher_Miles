import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TodoCard = ({ todo, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: todo.todo_id,
        data: {
            type: 'Todo',
            todo
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-500 text-white';
            case 'High': return 'bg-orange-500 text-white';
            case 'Normal': return 'bg-blue-500 text-white';
            case 'Low': return 'bg-slate-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group bg-bg-card border border-border-main p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing relative"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${getPriorityColor(todo.priority)}`}>
                    {todo.priority}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(todo.todo_id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-text-muted hover:text-red-500 rounded-md transition-all"
                >
                    <span className="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>

            <h4 className="text-sm font-bold text-text-main mb-1 line-clamp-2">{todo.title}</h4>
            <p className="text-[11px] text-text-muted line-clamp-2 mb-3 leading-relaxed">
                {todo.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-border-main/50">
                <div className="flex items-center gap-1.5">
                    <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold uppercase">
                        {todo.assignee_first_name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-[10px] font-medium text-text-muted">
                        {todo.assignee_first_name ? `${todo.assignee_first_name}` : 'Unassigned'}
                    </span>
                </div>

                {todo.due_date && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${new Date(todo.due_date) < new Date() && todo.status !== 'Done' ? 'text-red-500' : 'text-text-muted'}`}>
                        <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                        {new Date(todo.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodoCard;
