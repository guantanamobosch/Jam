import React from "react";

import "../../pages/AuthPage/AuthPage.css";


export default function FirstNameSignUp({
    newUser,
    handleChange,
    setFormNumber,
}) {
    async function handleFirstNameSubmit(evt) {
        evt.preventDefault();
        setFormNumber(2);
    }

    return (
        <div className="signin-form-body">
            <form autoComplete="off" onSubmit={handleFirstNameSubmit}>

                <h3>Let's Get Jammin!</h3>
                <label>First Name</label>

                <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={newUser.first_name}
                    onChange={handleChange}
                    className="signin-form-input"
                    required
                />
                <button className="signin-form-button" type="submit">Next</button>
            </form>
        </div>

)};
