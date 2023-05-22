import "./App.css";
import background from "./background.mp4";
import React, { useEffect, useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const chunksRef = useRef([]);
  const [downloadButtonDisabled, setDownloadButtonDisabled] = useState(true);

  useEffect(() => {
    const constraints = { video: true };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  }, []);

  const handleStartRecording = () => {
    navigator.mediaDevices
      .getDisplayMedia({ video: { mediaSource: "screen" } })
      .then((stream) => {
        screenStreamRef.current = stream;
        const combinedStream = new MediaStream([
          ...screenStreamRef.current.getTracks(),
          ...videoRef.current.srcObject.getTracks(),
        ]);

        const recorder = new MediaRecorder(combinedStream, {
          mimeType: 'video/webm; codecs="vp9"',
        });
        setMediaRecorder(recorder);
        chunksRef.current = [];

        recorder.ondataavailable = (event) => {
          chunksRef.current.push(event.data);
        };

        recorder.onstop = () => {
          setDownloadButtonDisabled(false);
        };

        recorder.start();
        setIsRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing screen:", error);
      });
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleDownload = () => {
    if (chunksRef.current.length === 0) {
      return;
    }

    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recording.webm";
    a.click();

    chunksRef.current = [];
    setDownloadButtonDisabled(true);
  };

  return (
    <div className="app">
      <video className="video-background" autoPlay loop muted>
        <source src={background} type="video/mp4" />
      </video>
      <div className="content">
        <video className="web-video" ref={videoRef} autoPlay muted></video>
        <div className="controls">
          {isRecording ? (
            <button onClick={handleStopRecording}>Stop Recording</button>
          ) : (
            <button onClick={handleStartRecording}>Start Recording</button>
          )}
          <button onClick={handleDownload} disabled={downloadButtonDisabled}>
            Download Recording
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
