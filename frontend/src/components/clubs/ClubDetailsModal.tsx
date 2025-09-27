// component for displaying club details in a modal
import React, { useEffect, useState } from "react";
import { clubAPI } from "@/services/api";
import { useRouter } from "next/navigation";

interface ClubDetailsModalProps {
  clubId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ClubDetailsModal({ clubId, open, onClose }: ClubDetailsModalProps) {
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open && clubId) {
      setLoading(true);
      clubAPI.getClub(clubId).then(data => {
        if (data.success) setClub(data.club);
        else setClub(null);
        setLoading(false);
      });
    } else {
      setClub(null);
    }
  }, [open, clubId]);

  if (!open || !clubId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {loading ? (
          <div>Loading...</div>
        ) : club ? (
          <>
            <h2 className="text-2xl font-bold mb-2">{club.name}</h2>
            <p className="mb-4">{club.description}</p>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div><strong>Location:</strong> {club.location || "N/A"}</div>
              <div><strong>Date:</strong> {club.club_date ? new Date(club.club_date).toLocaleDateString() : "N/A"}</div>
              <div><strong>Time:</strong> {club.club_time || "N/A"}</div>
              <div><strong>Contact:</strong> {club.contact_email || "N/A"}</div>
              <div><strong>Members:</strong> {club.members_count || 0}</div>
              <div><strong>Join Link:</strong> {club.join_link ? (
                <a href={club.join_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {club.join_link}
                </a>
              ) : "N/A"}</div>
              {club.image_url && (
                <div className="mt-2">
                  <img src={club.image_url} alt={club.name} className="max-h-40 rounded" />
                </div>
              )}
            </div>
            {/* join club button */}
            <button
              className="mt-4 w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              type="button"
              onClick={() => {
                onClose();
                router.push(`/clubs/join/${club.id}`);
              }}
            >
              Join
            </button>
          </>
        ) : (
          <div className="text-red-500">Club not found.</div>
        )}
      </div>
    </div>
  );
}