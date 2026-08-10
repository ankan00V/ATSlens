import { useState, Suspense, lazy } from 'react';
const Navbar = lazy(() => import('./components/Navbar'));
const HeroSection = lazy(() => import('./components/Hero'));

function App() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div className="bg-hero-bg min-h-screen">
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <Navbar onOpenAssessment={() => setIsModalOpen(true)} />
        <HeroSection
          isModalOpen={isModalOpen}
          onOpenModal={() => setIsModalOpen(true)}
          onCloseModal={() => setIsModalOpen(false)}
        />
      </Suspense>
    </div>
  );
}

export default App;
