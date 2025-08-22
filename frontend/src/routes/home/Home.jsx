// src/components/Home.jsx
import { Link } from 'react-router-dom';
import "./Home.css";

export default function Home() {
    return (
        <div
            id="home">

            <div id="name">Ronak Mistry</div>

            <a href="https://www.linkedin.com/in/ronakmystery/" target="_blank" className='app-link'>
                <button>💼 LinkedIn</button>
            </a>

            <a href="https://www.youtube.com/@ronakmystery" target='_blank' className='app-link'>
                <button>▶️ YouTube</button>
            </a>

            <a href="mailto:ronakmystery@gmail.com" className="app-link"
                target='_blank' >
                <button> ✉️ Email</button>
            </a>






            <div id="projects">Projects<br />



                <a href="https://docs.google.com/document/d/1G9MBPFnRx0pElZVMMPjOrEdZZptabEYYqhq7d-aDQvM/edit?usp=sharing" target='_blank' className='app-link'>
                    <button>📄 Piano Research</button>
                </a>

                <Link to="/piano" className='app-link'>
                    <button>🎹 Piano App</button>
                </Link>

                <a href="https://www.figma.com/board/J3vrG1tmGwh1iQtfzRRc1P/robot?node-id=0-1&t=GCfOxQNGabXSu1yf-1" target='_blank' className='app-link'>
                    <button>🤖 Robot dog</button>
                </a>

            </div>


            <div id="qr-code">
                <img src="/qr.png" alt="QR Code" />
            </div>

        </div>
    );
}
