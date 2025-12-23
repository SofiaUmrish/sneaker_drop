import React, { useState } from 'react';
import HeroSection from '../../components/HeroSection/HeroSection';
import DropsGrid from '../../components/DropsGrid/DropsGrid';
import InstantAlertModal from '../../components/InstantAlertModal/InstantAlertModal';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';

const Home = () => {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedDrop, setSelectedDrop] = useState(null);
    const { token } = useAuth();

    const openAlertModal = (sneaker) => {
        setSelectedDrop(sneaker);
        setIsAlertOpen(true);
    };

    const handleConfirmAlert = async () => {
        if (!selectedDrop) return;

        try {
            const response = await fetch(`${config.API_BASE_URL}/reminders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ shoe_id: selectedDrop.id })
            });

            if (response.ok) {
                console.log("Reminder set successfully");
            } else {
                console.error("Failed to set reminder");
            }
        } catch (error) {
            console.error("Error setting reminder:", error);
        }

        setIsAlertOpen(false);
    };

    return (
        <div className="home-page">
            <HeroSection onSetReminder={openAlertModal} />
            <DropsGrid onSetReminder={openAlertModal} />

            <InstantAlertModal
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                onConfirm={handleConfirmAlert}
                shoe={selectedDrop}
            />
        </div>
    );
};

export default Home;