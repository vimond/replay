import * as React from 'react';

const LoadingAnimation = () => (
  <svg width="100%" height="100%" viewBox="0 0 38 38" stroke="currentColor">
    <g fill="none" fillRule="evenodd">
      <g transform="translate(1 1)" strokeWidth="2">
        <circle stroke="currentColor" strokeOpacity="0.5" cx="18" cy="18" r="18" />
        <path className="animated" d="M36 18c0-9.94-8.06-18-18-18">

        </path>
      </g>
    </g>
  </svg>
);

export default LoadingAnimation;

/*
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 18"
            to="360 18 18"
            dur="1s"
            repeatCount="indefinite"
          />


 */