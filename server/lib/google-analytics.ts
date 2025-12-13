import { BetaAnalyticsDataClient } from "@google-analytics/data";

let analyticsClient: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient | null {
  if (analyticsClient) return analyticsClient;
  
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    console.warn("GOOGLE_APPLICATION_CREDENTIALS_JSON not set");
    return null;
  }
  
  try {
    const credentials = JSON.parse(credentialsJson);
    analyticsClient = new BetaAnalyticsDataClient({ credentials });
    return analyticsClient;
  } catch (error) {
    console.error("Failed to parse GA credentials:", error);
    return null;
  }
}

export function isGoogleAnalyticsConnected(): boolean {
  return !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && !!process.env.GA4_PROPERTY_ID;
}

export interface AnalyticsData {
  overview: {
    activeUsers: number;
    sessions: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  byCountry: Array<{ country: string; users: number }>;
  byDevice: Array<{ device: string; users: number }>;
  byPage: Array<{ page: string; views: number }>;
  bySource: Array<{ source: string; users: number }>;
}

export async function getAnalyticsData(startDate: string = "30daysAgo", endDate: string = "today"): Promise<AnalyticsData | null> {
  const client = getClient();
  const propertyId = process.env.GA4_PROPERTY_ID;
  
  if (!client || !propertyId) {
    return null;
  }
  
  try {
    const [overviewResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    });

    const [countryResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    });

    const [deviceResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    });

    const [pageResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    });

    const [sourceResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    });

    const overviewRow = overviewResponse.rows?.[0];
    
    return {
      overview: {
        activeUsers: parseInt(overviewRow?.metricValues?.[0]?.value || "0"),
        sessions: parseInt(overviewRow?.metricValues?.[1]?.value || "0"),
        pageViews: parseInt(overviewRow?.metricValues?.[2]?.value || "0"),
        avgSessionDuration: parseFloat(overviewRow?.metricValues?.[3]?.value || "0"),
        bounceRate: parseFloat(overviewRow?.metricValues?.[4]?.value || "0"),
      },
      byCountry: (countryResponse.rows || []).map(row => ({
        country: row.dimensionValues?.[0]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
      })),
      byDevice: (deviceResponse.rows || []).map(row => ({
        device: row.dimensionValues?.[0]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
      })),
      byPage: (pageResponse.rows || []).map(row => ({
        page: row.dimensionValues?.[0]?.value || "Unknown",
        views: parseInt(row.metricValues?.[0]?.value || "0"),
      })),
      bySource: (sourceResponse.rows || []).map(row => ({
        source: row.dimensionValues?.[0]?.value || "(direct)",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch Google Analytics data:", error);
    return null;
  }
}
