import { NextResponse } from "next/server";

const MOCK_DATA = {
  tenants: [
    {
      id: "t-1",
      name: "William Terra",
      avatar: "https://i.pravatar.cc/150?u=william",
      stats: {
        allOffers: 9,
        pendingReview: 54,
        pendingFollowUp: 5,
      },
      offers: [
        {
          id: "o-1",
          company: "Monster Energy",
          logo: "M",
          priority: "Medium",
          priorityScore: "5/10",
          priorityColor: "text-indigo-500 bg-indigo-50",
          type: "Paid sponsorship",
          extractedDate: "15 December 2025",
          title: "Monster Energy Collaboration Offer",
          description:
            "Monster Energy is offering either a free drink or $2500 to mention the word 'Anker' for 30 seconds",
          status: "pending",
        },
        {
          id: "o-2",
          company: "Nike",
          logo: "N",
          priority: "Medium",
          priorityScore: "5/10",
          priorityColor: "text-indigo-500 bg-indigo-50",
          type: "Paid sponsorship",
          extractedDate: "15 December 2025",
          title: "Nike 30-second spot sponsorship",
          description:
            "Nike is offering either a free drink or $2500 to mention the word 'Anker' for 30 seconds",
          status: "pending",
        },
        {
          id: "o-3",
          company: "Pepsi",
          logo: "P",
          priority: "Medium",
          priorityScore: "5/10",
          priorityColor: "text-indigo-500 bg-indigo-50",
          type: "Paid sponsorship",
          extractedDate: "15 December 2025",
          title: "Pepsi 30-second spot sponsorship",
          description:
            "Pepsi is offering either a free drink or $2500 to mention the word 'Anker' for 30 seconds",
          status: "pending",
        },
        {
          id: "o-4",
          company: "Sprite",
          logo: "S",
          priority: "High",
          priorityScore: "8/10",
          priorityColor: "text-emerald-500 bg-emerald-50",
          type: "Paid sponsorship",
          extractedDate: "15 December 2025",
          title: "Sprite Sponsorship Opportunity",
          description:
            "Sprite is asking about a potential sponsorship but provides no details on platform, compensation",
          status: "pending",
        },
        {
          id: "o-5",
          company: "Instagram",
          logo: "IG",
          priority: "High",
          priorityScore: "8/10",
          priorityColor: "text-emerald-500 bg-emerald-50",
          type: "Paid sponsorship",
          extractedDate: "15 December 2025",
          title: "Instagram Sponsorship Opportunity",
          description:
            "Instagram is asking about a potential sponsorship but provides no details on platform, compensation",
          status: "pending",
        },
        {
          id: "o-6",
          company: "Rive",
          logo: "R",
          priority: "Low",
          priorityScore: "5/10",
          priorityColor: "text-rose-500 bg-rose-50",
          type: "Paid sponsorship",
          extractedDate: "15 December 2025",
          title: "$15k Rive x Contra challenge",
          description:
            "Rive invites creators to enter a contest (Nov 20-Dec 2) with $15k in cash prizes for the best intera...",
          status: "pending",
        },
      ],
    },
  ],
};

export async function GET() {
  return NextResponse.json(MOCK_DATA);
}
