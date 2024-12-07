import React, { useState, useEffect } from 'react';
import { HeaderNav } from '../components/HeaderNav';
import { Calendar, MapPin, Users, ArrowLeft, Search, X } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../services/eventservice';
import { inscriptionService } from '../services/inscriptionservice';

export function EventDetailsPage() {
    const [eventDetails, setEventDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [userInscriptionId, setUserInscriptionId] = useState(null);

    const { eventId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const event = await getEventById(eventId);
                setEventDetails(event);

                const allInscriptions = await inscriptionService.getAllInscriptions();
                const filteredParticipants = allInscriptions.filter(
                    inscription => inscription.eventName === event.name
                );

                setParticipants(filteredParticipants);

                const userInscription = filteredParticipants.find(
                    inscription => inscription.username === 'currentUsername'
                );

                if (userInscription) {
                    setUserInscriptionId(userInscription.id);
                } else {
                    console.log('No inscription found for the current user.');
                }
            } catch (err) {
                setError(err.message || 'Failed to load event details.');
                console.error('Error fetching event details:', err);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const filteredParticipants = participants.filter(participant =>
        participant.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCancelInscription = async (id) => {
        try {
            const response = await inscriptionService.deleteInscription(id);
            console.log('Inscription cancelled:', response);
            setParticipants(prevParticipants =>
                prevParticipants.filter(participant => participant.id !== id)
            );
            navigate('/events');
        } catch (error) {
            console.error('Error cancelling inscription:', error);
        }
    };

    if (error) {
        return (
            <>
                <HeaderNav />
                <div className="container mx-auto px-4 pt-20 text-center text-red-500">
                    <p>Error: {error}</p>
                    <Link to="/events" className="text-blue-500 hover:underline">
                        Back to Events
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <HeaderNav />
            <div className="container mx-auto px-4 pt-20">
                <Link to="/events" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="mr-2" /> Back to Events
                </Link>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <div className="rounded-xl overflow-hidden shadow-lg">
                            <img
                                src={eventDetails?.imgEvent || "https://via.placeholder.com/600x400"}
                                alt={eventDetails?.name}
                                className="w-full h-96 object-cover"
                            />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold mb-4">{eventDetails?.name}</h1>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center">
                                <Calendar className="mr-3 text-blue-500" />
                                <span className="text-lg">{eventDetails?.startDate} - {eventDetails?.endDate}</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="mr-3 text-red-500" />
                                <span className="text-lg">{eventDetails?.place}</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-semibold mb-3">Event Description</h2>
                        <p className="text-gray-600 mb-6">{eventDetails?.description}</p>

                        <div className="bg-gray-100 p-6 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold flex items-center">
                                    <Users className="mr-3 text-green-500" />
                                    Registered Participants
                                    <span className="ml-2 bg-green-500 text-white rounded-full px-2 py-1 text-sm">
                                        {filteredParticipants.length}
                                    </span>
                                </h2>

                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search participants..."
                                        className="pl-10 pr-10 py-2 rounded-lg border w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-64 overflow-y-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Username</th>
                                            <th className="text-left py-2">Registration Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredParticipants.map(participant => (
                                            <tr key={participant.id} className="border-b last:border-b-0">
                                                <td className="py-2">{participant.username}</td>
                                                <td className="py-2">{participant.fecha_Inscripcion}</td>
                                                <td className="py-2">
                                                    {participant.username === 'superuser2' && (
                                                        <button
                                                            onClick={() => handleCancelInscription(participant.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredParticipants.length === 0 && (
                                    <div className="text-center py-4 text-gray-500">
                                        No participants found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EventDetailsPage;
