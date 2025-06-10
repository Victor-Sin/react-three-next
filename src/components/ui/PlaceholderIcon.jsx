import { useState } from 'react';

function PlaceholderIcon({
    children,
    onClick,
    x,
    y,
    width,
    height,
    className = '',
    style = {},
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`absolute cursor-pointer transition-all duration-300 hover:scale-110 ${className}`}
            style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${width}%`,
                height: `${height}%`,
                transform: `translate(-50%, -50%) scale(${isHovered ? 1.1 : 1})`,
                transformOrigin: 'center',
                ...style
            }}
        >
            {children}
        </div>
    );
}

export default PlaceholderIcon; 