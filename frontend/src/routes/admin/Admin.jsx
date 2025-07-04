import { use, useEffect, useState } from "react";
import "./Admin.css";
import { data } from "react-router-dom";
export default function Admin() {
    const [password, setPassword] = useState("");
    const [admin, setAdmin] = useState(null);
    const [code, setCode] = useState("");


    const handleLogin = async () => {
        const res = await fetch("/backend/admin/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        const data = await res.json();

        if (res.ok) {
            setAdmin(data.uuid)
            localStorage.setItem("admin", data.uuid);
        }
    };

    useEffect(() => {
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) {
            setAdmin(storedAdmin);
        }
    }, []);

    const getCurrentCode = async () => {
        const res = await fetch("/backend/admin/current_code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "uuid": admin }),
        });
        const data = await res.json();
        if (res.ok) setCode(data.code);
    };

    useEffect(() => {
        if (admin) {
            getCurrentCode();
            fetchEmails(admin)
                .then(data => {
                    console.log("Emails fetched:", data);
                    setEmails(data);
                })
        }
    }
        , [admin]);


    const generateCode = async () => {
        const res = await fetch("/backend/admin/update_code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "uuid": admin }),
        });
        const data = await res.json();
        if (res.ok) {
            setCode(data.code);
        }
    };


    const [emails, setEmails] = useState([]);

    async function fetchEmails() {
        const res = await fetch("/backend/admin/list_emails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uuid: admin }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unknown error");
        return data.emails;
    }

    const updateEmails = async () => {
        const res = await fetch("/backend/admin/update_emails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "uuid": admin, emails }),
        });


    };

    return (
        <div id="admin-page">

            {admin ? <>
                <div>code: {code}</div>

                <button onClick={() => generateCode()}>Generate New Code</button>

                <div>Emails</div>
                <div>
                    {
                        <textarea value={emails}
                            onChange={(e) => setEmails(e.target.value)}
                        />
                    }

                    <button onClick={updateEmails} style={{ marginTop: 10 }}>
                        Save pro emails
                    </button>
                </div>

            </> :
                <>    <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                    <button onClick={handleLogin}>Login</button>
                </>
            }






        </div>
    );
}
