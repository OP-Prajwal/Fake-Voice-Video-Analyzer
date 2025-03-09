import React, { useState } from 'react'

const Main = () => {
    const [preview, setPreview] = useState("");
    const [video, setVideo] = useState("");
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [audioPath, setAudioPath] = useState(null);
    const [result, setResult] = useState(null);

    const HandleSubmit = async () => {
        if (!video) {
            setError("Please upload a video file");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setResult(null);

            const formData = new FormData();
            formData.append('file', video);

            // Step 1: Upload the video to Flask API
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            console.log("data ",data)
            console.log("Audio Path:", data.audio_path);

            setAudioPath(data.audio_path);

            // Step 2: Send the audio to /predict endpoint
            const audioResponse = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                body: JSON.stringify({ audio_path: data.audio_path }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!audioResponse.ok) {
                throw new Error('Prediction failed');
            }

            const resultData = await audioResponse.json();
            console.log("result data ",resultData);
            setResult(resultData);

            // Clear form after successful upload
            setVideo("");
            setInput("");
            setPreview("");
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        setInput(e.target.value);
        const file = e.target.files[0];
        console.log(file);
        if (file) {
            setVideo(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className='min-h-screen text-white'>
            <h1 className='text-4xl font-bold text-center py-8'>AI Audio Detector</h1>
            <div className='container mx-auto px-4'>
                <div className='text-center mt-10'>
                    <h1 className='text-2xl font-semibold mb-6'>Video Detector</h1>
                    <div className='border-2 border-white/20 rounded-lg p-8 max-w-md mx-auto items-center'>
                        <label className='block mb-4 text-lg'>Upload a video</label>
                        <input
                            type="file"
                            accept='video/*'
                            value={input}
                            onChange={(e) => handleFileChange(e)}
                            className={`border-2 border-white/20 rounded p-2 w-full ${input ? 'text-white' : 'text-gray-400'}`}
                        />

                        {preview && <video src={preview} controls className='w-full max-w-md mb-4 rounded-lg mt-2'></video>}
                        {error && <p className='text-red-500 mb-4'>{error}</p>}
                        <button
                            onClick={HandleSubmit}
                            disabled={loading}
                            className={`bg-blue-900 px-2 py-1 rounded-lg text-xl justify-center items-center flex mt-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>

                        {result && (
                            <div className='mt-4 p-4 border border-green-500 rounded-lg'>
                                <p className='text-lg'><strong>Prediction:</strong> {result.prediction}</p>
                                <p className='text-lg'><strong>Confidence:</strong> {result.confidence}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Main;
