// src/components/Home.jsx
import { Link } from 'react-router-dom';
import "./home.css";

export default function Home() {
    return (
        <div
            id="home">
            <a href="https://www.linkedin.com/in/ronakmystery/" target="_blank" className='app-link'>
                <button>💼 LinkedIn</button>
            </a>

            <Link to="/piano" className='app-link'>
                <button>Piano</button>
            </Link>
        </div>
    );
}
