export default function MobileContainer({ children }) {
  return (
    <div className="w-full min-h-screen flex justify-center items-start bg-[grey] pt-[10px]">
      <div
        className="w-[375px] h-[calc(100vh-10px)] bg-transparent relative shadow-lg overflow-hidden rounded-lg"
      >
        {children}
      </div>
    </div>
  );
}
