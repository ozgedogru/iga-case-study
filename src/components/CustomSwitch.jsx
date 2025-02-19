const CustomSwitch = ({ checked, onChange }) => {
  return (
    <div
      className={`w-16 h-8 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-all ${
        checked ? "bg-blue-500" : "bg-gray-400"
      }`}
      onClick={onChange}
    >
      <div
        className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all ${
          checked ? "translate-x-8" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
};
export default CustomSwitch;
