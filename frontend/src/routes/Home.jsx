// src/components/Home.jsx
import { Link } from 'react-router-dom';
import "./home.css";

export default function Home() {
    return (
        <div
            id="home">
            Ronak Mistry
             <a href="https://www.linkedin.com/in/ronakmystery/" target="_blank">
                <button>💼 LinkedIn</button>
            </a>

            <Link to="/piano" >
                <button>        Piano Visualizer
                </button>
            </Link>
        </div>
    );
}
