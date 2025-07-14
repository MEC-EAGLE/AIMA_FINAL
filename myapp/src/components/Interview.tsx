import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';

export default function Interview() {
  const navigate = useNavigate();
  const localVideo = useRef(null as any);

  useEffect(() => {
    const u = localStorage.getItem('currentUser');
    if (!u) return navigate('/login');
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }
      })
      .catch(() => {});
  }, [navigate]);

  return (
    <div>
      <Nav />
      <div className="container my-4" style={{ maxWidth: '600px' }}>
        <h2>Video Interview</h2>
        <video ref={localVideo} autoPlay playsInline style={{ width: '100%', maxHeight: '400px' }} />
        <p className="mt-3">This demo only shows your camera feed.</p>
      </div>
    </div>
  );
}
