import { usePiano } from "../../PianoContext";

import "./Settings.css";

export default function Settings() {

    const { userid, email, files } = usePiano();

    return (
        <div id="settings">



            {userid && <div>
                <div id="username">{email}</div>

                <button
                    id="logout-button"
                    onClick={() => {
                        if (window.confirm("Are you sure you want to log out?")) {
                            localStorage.removeItem("uuid");
                            localStorage.removeItem("code");
                            window.location.reload();
                        }
                    }}
                >
                    LOGOUT
                </button>


            </div>
            }


            <div id="app-updates"> 📦 v1.3</div>



        </div >
    );
}
