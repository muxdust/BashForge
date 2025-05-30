import { NextResponse } from "next/server";
import databaseClient from "../../../../prisma/db";
import { LRUCache } from "next/dist/server/lib/lru-cache";

const cache = new LRUCache({ max: 100, ttl: 1000 * 60 * 10 });

export async function GET() {
  if (cache.has("leaderboardData")) {
    return NextResponse.json({
      message: "Data fetched successfully",
      status: 200,
      data: cache.get("leaderboardData"),
    });
  }

  try {
    const leaderboardData = await databaseClient.user.findMany({
      select: {
        name: true,
        gitUsername: true,
        twitterUsername: true,
        profileImage: true,
        streak: true,
        activities: {
          select: {
            languageName: true,
            shortLanguageName: true,
            totalDuration: true,
            last24HoursDuration: true,
            last7DaysDuration: true,
          },
        },
      },
    });

    cache.set("leaderboardData", leaderboardData);

    return NextResponse.json({
      message: "Data fetched successfully",
      status: 200,
      data: leaderboardData,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Something went wrong",
      status: 500,
    });
  }
}
