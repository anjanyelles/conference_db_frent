import React from 'react';

const VideoGrid = ({ streams, localVideoRef }) => {
  const getGridClass = (count) => {
    if (count === 1) return 'grid-cols-1 grid-rows-1';
    if (count === 2) return 'grid-cols-2 grid-rows-1';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 9) return 'grid-cols-3 grid-rows-3';
    return 'grid-cols-4 grid-rows-4';
  };

  return (
    <div className={`h-full grid ${getGridClass(streams.length)} gap-4`}>
      {streams.map((streamData, index) => (
        <div key={streamData.socketId} className="video-item bg-black rounded-lg overflow-hidden relative">
          {/* Video Element */}
          {streamData.socketId === 'local' ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              ref={videoRef => {
                if (videoRef && streamData.stream) {
                  videoRef.srcObject = streamData.stream;
                }
              }}
            />
          )}
          
          {/* User Info Overlay */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {streamData.user.name}
            {streamData.socketId === 'local' && ' (You)'}
          </div>
          
          {/* Status Icons */}
          <div className="absolute top-2 right-2 flex space-x-1">
            {!streamData.videoEnabled && (
              <div className="bg-black bg-opacity-50 p-1 rounded">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {!streamData.audioEnabled && (
              <div className="bg-black bg-opacity-50 p-1 rounded">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            )}
            {streamData.screenSharing && (
              <div className="bg-yellow-500 p-1 rounded">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;