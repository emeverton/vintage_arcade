import EventsSection from './components/EventsSection';
import ExperienceSection from './components/ExperienceSection';
import MenuSection from './components/MenuSection';
import ReviewsSection from './components/ReviewsSection';
import VintageCabinet from './components/VintageCabinet';
import VisitSection from './components/VisitSection';

export default function HomePage() {
  return (
    <main className="va-page">
      <div className="va-bg" aria-hidden="true" />
      <div className="va-wrap">
        <VintageCabinet />
        <div className="va-below">
          <ExperienceSection />
          <MenuSection />
          <EventsSection />
          <ReviewsSection />
          <VisitSection />
        </div>
      </div>
    </main>
  );
}
