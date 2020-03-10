const query = `
query (
  $ids: [String]!,
  $start: DateTime!,
  $timeRange: Int!,
  $limit: Int!,
  $omitNonBoarding: Boolean!
) {
  quays (ids: $ids) {
    id
    estimatedCalls (
      startTime: $start,
      timeRange: $timeRange,
      numberOfDepartures: $limit,
      omitNonBoarding: $omitNonBoarding
    ) {
      date
      forBoarding
      requestStop
      forAlighting
      situations {
        situationNumber
        summary { value }
        description { value }
        detail { value }
        validityPeriod { startTime endTime }
        reportType
        infoLinks { uri label }
      }
      destinationDisplay { frontText }
      notices { text }
      aimedDepartureTime
      expectedDepartureTime
      realtime
      cancellation
      quay { id name publicCode description }
      serviceJourney {
        id
        publicCode
        transportSubmode
        journeyPattern {
          line { notices { text } }
          notices { text }
        }
        notices { text }
        line {
          id
          name
          publicCode
          notices { text }
          bookingArrangements {
            bookingMethods
            bookingNote
            minimumBookingPeriod
            bookingContact { phone url }
          }
          flexibleLineType
          transportMode
          description
        }
      }
    }
  }
}
`;

export { query };
