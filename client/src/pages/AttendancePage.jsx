import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';

function AttendancePage() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start camera on component mount
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Could not access camera. Please enable permissions.');
        console.error('Camera error:', err);
      }
    }
    setupCamera();

    // Cleanup: stop camera stream when component unmounts
    return () => {
        if(videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
    };
  }, []);

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImageSrc(dataUrl);
    }
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('Geolocation is not supported by your browser.');
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position.coords),
                (err) => reject(`Could not get location: ${err.message}`)
            );
        }
    });
  };

  const handleAction = async (action) => {
    setError('');
    if (!imageSrc) {
      return setError('Please capture a selfie first.');
    }
    setLoading(true);

    try {
        const coords = await getLocation();
        setLocation(coords);

        const blob = await (await fetch(imageSrc)).blob();
        const formData = new FormData();
        formData.append('selfie', blob, 'selfie.jpg');
        formData.append('latitude', coords.latitude);
        formData.append('longitude', coords.longitude);

        const res = await axios.post(`/api/attendance/${action}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert(`Successfully ${action}ed at ${new Date(res.data[`${action}Time`]).toLocaleTimeString()}`);
    } catch (err) {
        setError(err.response?.data?.msg || err.message || `Failed to ${action}.`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Daily Attendance
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxWidth: '400px', border: '1px solid #ddd' }} />
            <Button variant="contained" onClick={captureImage} sx={{ mt: 2 }}>Capture Selfie</Button>
        </Box>
      </Paper>

      {imageSrc && (
        <Paper sx={{ p: 2, mt: 2 }}>
            <Typography>Captured Image:</Typography>
            <img src={imageSrc} alt="Captured Selfie" style={{ width: '100%', maxWidth: '400px' }} />
        </Paper>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => handleAction('check-in')} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Check-in'}
        </Button>
        <Button variant="contained" color="secondary" onClick={() => handleAction('check-out')} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Check-out'}
        </Button>
      </Box>
    </Container>
  );
}

export default AttendancePage;
