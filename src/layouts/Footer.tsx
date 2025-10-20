export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500 bg-black">
      <p>© {new Date().getFullYear()} Social Media Services. All rights reserved.</p>
    </footer>
  );
}