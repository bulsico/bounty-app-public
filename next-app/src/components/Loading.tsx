export default function Loading({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-24">
      Loading {text}...
    </div>
  );
}
