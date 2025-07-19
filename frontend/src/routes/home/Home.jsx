// src/components/Home.jsx
import { Link } from 'react-router-dom';
import "./Home.css";

export default function Home() {
    return (
        <div
            id="home">

            <div id="name">Ronak Mistry</div>
            <div>Software Engineer and Classical Pianist</div>

            <a href="https://www.linkedin.com/in/ronakmystery/" target="_blank" className='app-link'>
                <button>LinkedIn</button>
            </a>

            <a href="https://www.youtube.com/@ronakmystery" target='_blank' className='app-link'>
                <button>YouTube</button>
            </a>

            <a href="mailto:ronakmystery@gmail.com" className="app-link"
                target='_blank' >
                <button>Email</button>
            </a>



            <div>Projects<br />

                <Link to="/piano" className='app-link'>
                    <button>Piano</button>
                </Link>

            </div>


            <div id="qr-code">
                <img src="/qr.png" alt="QR Code" />
            </div>

        </div>
    );
}
