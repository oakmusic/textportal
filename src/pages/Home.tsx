import ActionCard from '../components/ActionCard';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-8 flex-grow justify-center pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
        <ActionCard 
          to="/send"
          icon={<img src="/send-icon.png" alt="Send" className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(255,77,77,0.5)]" />}
          label={t('home_send')}
          variant="send"
        />
        <ActionCard 
          to="/receive"
          icon={<img src="/receive-icon.png" alt="Receive" className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(77,166,255,0.5)]" />}
          label={t('home_receive')}
          variant="receive"
        />
      </div>
    </div>
  );
}
