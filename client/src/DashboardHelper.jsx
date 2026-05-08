import Chat from './pages/Chat';
import Reminders from './pages/Reminders';

const DashboardHelper = ({ mode }) => {
    if (mode === 'reminders') {
        return <Reminders />;
    }
    return <Chat mode={mode} />;
};

export default DashboardHelper;
