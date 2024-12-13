// src/SignaturePad.js
import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import './SignaturePad.css';

const socket = io();

const SignaturePad = () => {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState('black');
    const [brushSize, setBrushSize] = useState(2);
    const lastPos = useRef({ x: 0, y: 0 });

    const startDrawing = (e) => {
        setDrawing(true);
        lastPos.current = getMousePos(e);
    };

    const stopDrawing = () => {
        setDrawing(false);
    };

    const draw = (e) => {
        if (!drawing) return;

        const ctx = canvasRef.current.getContext('2d');
        const currentPos = getMousePos(e);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = color;
        ctx.stroke();

        socket.emit('draw', {
            color,
            brushSize,
            lastPos: lastPos.current,
            currentPos,
        });

        lastPos.current = currentPos;
    };

    const getMousePos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const saveSignature = () => {
        const dataUrl = canvasRef.current.toDataURL();
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'signature.png';
        a.click();
    };

    useEffect(() => {
        socket.on('draw', (data) => {
            const ctx = canvasRef.current.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(data.lastPos.x, data.lastPos.y);
            ctx.lineTo(data.currentPos.x, data.currentPos.y);
            ctx.lineWidth = data.brushSize;
            ctx.strokeStyle = data.color;
            ctx.stroke();
        });
    }, []);

    return (
        <div className="signature-container">
            <h2>Sign Your Name</h2>
            <canvas
                ref={canvasRef}
                width="500"
                height="200"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                className="canvas"
            />
            <div className="button-container">
                <button onClick={clearCanvas}>Clear</button>
                <button onClick={saveSignature}>Save Signature</button>
            </div>
            <div className="controls">
                <button onClick={() => setColor('black')}>Black</button>
                <button onClick={() => setColor('blue')}>Blue</button>
                <button onClick={() => setColor('red')}>Red</button>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={brushSize}
                    onChange={(e) => setBrushSize(e.target.value)}
                />
            </div>
            <footer>
                <p>Signature Application - Built with React and Socket.io</p>
            </footer>
        </div>
    );
};

export default SignaturePad;
