import React, { Fragment, useState, useEffect, useRef } from "react";

const EditTodo = ({ todo, getTodos, user }) => {
    const [description, setDescription] = useState(todo.description);
    const [amount, setAmount] = useState(todo.amount ?? "");
    const inputRef = useRef(null);
    const editBtnRef = useRef(null);

    const updateTodo = async (e) => {
        e.preventDefault();

        // Skip if nothing changed
        const descUnchanged = description.trim() === (todo.description ?? "").trim();
        const amtUnchanged = String(amount) === String(todo.amount ?? "");
        if (descUnchanged && amtUnchanged) {
            console.log("No changes detected — skipping update");
            return;
        }

        // Validate amount
        if (amount !== "" && isNaN(Number(amount))) {
            console.error("Amount must be a number");
            return;
        }

        try {
            const body = {
                description: description.trim(),
                amount: amount === "" ? null : Number(amount),
                user_id: todo.user_id ?? user.user_id, // owner of the todo
                role: user.role, // inform backend if superadmin
            };

            await fetch(`http://localhost:5000/todos/${todo.todo_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });

            if (typeof getTodos === "function") getTodos();
        } catch (err) {
            console.error(err.message);
        }
    };

    // Auto-focus input on modal open
    useEffect(() => {
        const modal = document.getElementById(`id${todo.todo_id}`);
        const handleShown = () => inputRef.current?.focus();
        if (modal) modal.addEventListener("shown.bs.modal", handleShown);
        return () => modal && modal.removeEventListener("shown.bs.modal", handleShown);
    }, [todo.todo_id]);

    // Enter key triggers Edit button
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                editBtnRef.current?.click();
            }
        };
        const modal = document.getElementById(`id${todo.todo_id}`);
        if (modal) modal.addEventListener("keydown", handleKeyDown);
        return () => modal && modal.removeEventListener("keydown", handleKeyDown);
    }, [todo.todo_id]);

    // Tab focus trap inside modal
    useEffect(() => {
        const modal = document.getElementById(`id${todo.todo_id}`);
        if (!modal) return;

        const focusableEls = modal.querySelectorAll("input, button, [tabindex]:not([tabindex='-1'])");
        if (!focusableEls.length) return;

        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        const handleTab = (e) => {
            if (e.key !== "Tab") return;
            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                }
            } else {
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        };

        document.addEventListener("keydown", handleTab);
        return () => document.removeEventListener("keydown", handleTab);
    }, [todo.todo_id]);

    return (
        <Fragment>
            <button
                type="button"
                className="btn btn-warning"
                data-bs-toggle="modal"
                data-bs-target={`#id${todo.todo_id}`}
            >
                Edit
            </button>

            <div
                className="modal"
                id={`id${todo.todo_id}`}
                onClick={(e) => {
                    if (e.target.id === `id${todo.todo_id}` || e.target === e.currentTarget) {
                        setDescription(todo.description);
                        setAmount(todo.amount ?? "");
                    }
                }}
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Todo</h4>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                onClick={() => {
                                    setDescription(todo.description);
                                    setAmount(todo.amount ?? "");
                                }}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <input
                                ref={inputRef}
                                type="text"
                                className="form-control mb-2"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <input
                                type="number"
                                className="form-control"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount..."
                                step="1"
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                ref={editBtnRef}
                                type="button"
                                className="btn btn-warning"
                                data-bs-dismiss="modal"
                                onClick={(e) => updateTodo(e)}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                onClick={() => {
                                    setDescription(todo.description);
                                    setAmount(todo.amount ?? "");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default EditTodo;