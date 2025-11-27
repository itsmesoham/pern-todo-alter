import React, { Fragment, useState, useRef, useEffect } from 'react';

const InputTodo = ({ user }) => {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(""); // new state for amount
    const inputRef = useRef(null); // reference to the description input

    // Auto-focus the description input when component loads
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onSubmitForm = async (e) => {
        e.preventDefault();

        if (description.trim() === "") {
            alert("Please enter a todo description before adding!");
            return;
        }

        if (amount === "" || isNaN(amount)) {
            alert("Please enter a valid amount!");
            return;
        }

        try {
            // include user_id in the request
            const body = { description, amount, user_id: user.user_id }; // <-- added user_id
            const response = await fetch("http://localhost:5000/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    description,
                    amount,
                    user_id: user.user_id
                })
            });

            if (response.ok) {
                setDescription("");
                setAmount("");
                inputRef.current?.focus();

                // Refresh todo list
                window.dispatchEvent(new Event("todoAdded"));
            }

        } catch (err) {
            console.error(err.message);
        }
    };


    return (
        <Fragment>
            <h1 className="text-center">PERN Todo List</h1>
            <form className="d-flex flex-row gap-2 mt-3" onSubmit={onSubmitForm}>
                <input
                    type="text"
                    className="form-control"
                    ref={inputRef}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a todo..."
                />
                <input
                    type="number"
                    className="form-control"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount..."
                />
                <button className="btn btn-success">Add</button>
            </form>
        </Fragment>
    );
};

export default InputTodo;