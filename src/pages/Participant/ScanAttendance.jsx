import React from 'react';
import QRScanner from '../../components/QRScanner'; // Adjust path if needed

const ScanAttendance = () => {
    return (
        <div className="flex flex-col items-center justify-center p-6 h-full w-full">
            
            {/* FIX: Changed 'max-w-md' to 'max-w-[350px]' 
               This forces the camera to be smaller, regardless of screen width.
            */}
            <div className="w-full max-w-[350px] aspect-square relative border-4 border-gray-800 rounded-xl overflow-hidden shadow-xl bg-black">
                <QRScanner />
            </div>
        </div>
    );
};

export default ScanAttendance;