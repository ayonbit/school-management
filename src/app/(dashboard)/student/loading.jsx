const Loading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );
};

export default Loading;
