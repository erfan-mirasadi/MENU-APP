import { RiLoader4Line } from "react-icons/ri";

export default function Loader({ size = "large", className = "" }) {
  // Size classes based on prop
  const sizeClasses = {
    small: "text-xl", // For buttons
    medium: "text-4xl", // For sections
    large: "text-6xl", // For full page
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <RiLoader4Line
        className={`animate-spin text-primary ${
          sizeClasses[size] || sizeClasses.medium
        }`}
      />
    </div>
  );
}
