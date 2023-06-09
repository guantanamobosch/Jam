import React from "react";
import { useState } from "react";
import { signUp } from "../../utilities/users/users-service";
import FirstNameSignUp from "./FirstNameSignUp";
import LastNameSignUp from "./LastNameSignUp";
import UsernameSignUp from "./UsernameSignUp";
import EmailSignUp from "./EmailSignUp";
import PasswordSignUp from "./PasswordSignUp";
import "../../pages/AuthPage/AuthPage.css";
import PfpSignUp from "./PfpSignUp";
import SuccessSignUp from "./SuccessSignUp";

export default function SignUpForm({ setUser }) {
    const [formNumber, setFormNumber] = useState(1);

    const [newUser, setNewUser] = useState({
        first_name: "",
        last_name: "",
        username: "",
        profile_picture: "",
        email: "",
        password: "",
        confirm: "",
        error: "",
    });

    function handleChange(evt) {
        setNewUser({
            ...newUser,
            [evt.target.name]: evt.target.value,
            error: "",
        });
    }

    async function handleSubmit(evt) {
        evt.preventDefault();
        try {
            const {
                first_name,
                last_name,
                username,
                profile_picture,
                email,
                password,
            } = newUser;
            const formData = {
                first_name,
                last_name,
                username,
                profile_picture,
                email,
                password,
            };

            // 🙋🏽‍♂️ passing user data to user signUp function from utilities/users/users-service
            const user = await signUp(formData);
            setUser(user);
        } catch {
            setNewUser({ error: "Sign up failed - try again" });
        }
    }

    function whichForm() {
        if (formNumber === 1) {
            return (
                <FirstNameSignUp
                    newUser={newUser}
                    handleChange={handleChange}
                    setFormNumber={setFormNumber}
                />
            );
        } else if (formNumber === 2) {
            return (
                <LastNameSignUp
                    newUser={newUser}
                    handleChange={handleChange}
                    setFormNumber={setFormNumber}
                />
            );
        } else if (formNumber === 3) {
            return (
                <UsernameSignUp
                    newUser={newUser}
                    handleChange={handleChange}
                    setFormNumber={setFormNumber}
                />
            );
        } else if (formNumber === 4) {
            return (
                <PfpSignUp
                    newUser={newUser}
                    handleChange={handleChange}
                    setFormNumber={setFormNumber}
                />
            );
        } else if (formNumber === 5) {
            return (
                <EmailSignUp
                    newUser={newUser}
                    handleChange={handleChange}
                    setFormNumber={setFormNumber}
                />
            );
        } else if (formNumber === 6) {
            return (
                <PasswordSignUp
                    newUser={newUser}
                    handleChange={handleChange}
                    setFormNumber={setFormNumber}
                    handleSubmit={handleSubmit}
                />
            );
        } else if (formNumber === 7) {
            return <SuccessSignUp />;
        }
    }

    return <div>{whichForm()}</div>;
}
