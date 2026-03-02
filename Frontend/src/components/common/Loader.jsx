import React from 'react';
import Lottie from 'lottie-react';
import loaderAnimation from '../../assets/loader.json';

const Loader = ({ className = "h-48 w-48" }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Lottie
                animationData={loaderAnimation}
                loop={true}
                className="w-full h-full"
            />
        </div>
    );
};

export default Loader;
