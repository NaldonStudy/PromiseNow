interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, children }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded p-10 w-[80vw] max-w-[500px] shadow-lg">{children}</div>
    </div>
  );
};

export default Modal;
