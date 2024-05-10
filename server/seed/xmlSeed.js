import generateId from "../utils/generateId.js";
import getTimestamp from "../utils/getTimestamp.js";
import config from "../config/config.js";

// Date format Must be YYYY-MM-DD
const PARTNER_KEY = "proexsus_56786238";

const RATEXML = ({ date, roomId, hotelId }) => {
  return `
<?xml version="1.0" encoding="UTF-8"?>
<OTA_HotelRateAmountNotifRQ xmlns="http://www.opentravel.org/OTA/2003/05"
                            EchoToken="${generateId()}"
                            TimeStamp="${getTimestamp()}"
                            Version="3.0">
  <RateAmountMessages HotelCode="${hotelId}">
    <RateAmountMessage>
      <StatusApplicationControl Start="${date}"
                                End="${date}"
                                InvTypeCode="${roomId}"
                                RatePlanCode="PackageID_1"/>
      <Rates>
        <Rate>
          <BaseByGuestAmts>
            <BaseByGuestAmt AmountBeforeTax="100.00"
                            CurrencyCode="USD"/>
          </BaseByGuestAmts>
        </Rate>
      </Rates>
    </RateAmountMessage>
  </RateAmountMessages>
</OTA_HotelRateAmountNotifRQ>
`;
};

const addRoom = ({ hotelId = 10, roomId, roomData, packageId, packageData }) => {
  const { name, description, capacity, features, washroom } = roomData;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Transaction timestamp="${getTimestamp()}"
             id="${generateId()}"
             partner="${PARTNER_KEY}">
  <PropertyDataSet action="delta">
    <Property>${hotelId}</Property>
    <RoomData>
      <RoomID>${roomId}</RoomID>
      <Name>
        <Text text="${name}" language="en"/>
      </Name>
      <Description>
        <Text text="${description}" language="en"/>
      </Description>
       <AllowablePackageIDs>
        <AllowablePackageID>${packageId}</AllowablePackageID>
      </AllowablePackageIDs>
      <Capacity>${capacity.maxCapacity}</Capacity>
      <AdultCapacity>${capacity.adultCapacity}</AdultCapacity>
      ${capacity?.childCapacity && `<ChildCapacity>${capacity.childCapacity}</ChildCapacity>`}
      <OccupancySettings>
        <MinOccupancy>${capacity.minCapacity}</MinOccupancy>
        <MinAge>${capacity.minAge}</MinAge>
      </OccupancySettings>
      <RoomFeatures>
        <Beds>
        ${roomData.beds
          .map((bed) => {
            return `<Bed size="${
              bed === "Single"
                ? "single"
                : bed === "Semi Double"
                ? "semi_double"
                : bed === "Double"
                ? "double"
                : bed === "Queen"
                ? "queen"
                : "king"
            }"></Bed>`;
          })
          .join("")}
        </Beds>
        <MobilityAccessible/>
        <Smoking>${features.smoking ? "smoking" : "non_smoking"}</Smoking>
        <BathAndToilet relation="${washroom.relation === "Together" ? "together" : "separate"}">
          <Bath bathtub="${!washroom.bathTub ? "false" : "true"}" shower="${
    !washroom.shower ? "false" : "true"
  }"/>
          <Toilet electronic_bidet="${
            washroom.electronicBidet ? "true" : "false"
          }" mobility_accessible="${washroom.mobilityAccessible ? "true" : "false"}"/>
        </BathAndToilet>
        ${features.openAirBath ? `<OpenAirBath/>` : ``}
        ${features.airConditioning ? `<AirConditioning/>` : ``}
        ${features.balcony ? `<Balcony/>` : ``}
      </RoomFeatures>
    </RoomData>
    <PackageData>
      <PackageID>${packageId}</PackageID>
      <Name>
        <Text text="${packageData.name}" language="en"/>
      </Name>
      <Description>
        <Text text="${packageData.description}" language="en"/>
      </Description>
      <AllowableRoomIDs>
        <AllowableRoomID>${roomId}</AllowableRoomID>
      </AllowableRoomIDs>
      <Refundable available="${packageData.refundable ? "true" : "false"}" />
      <InternetIncluded>"${packageData.internet ? "true" : "false"}"</InternetIncluded>
      <ParkingIncluded>"${packageData.parking ? "true" : "false"}"</ParkingIncluded>
    </PackageData>
  </PropertyDataSet>
</Transaction>
`;
};

const updateRoom = ({ hotelId = 10, roomId, roomData }) => {
  const { name, description, capacity, features, washroom } = roomData;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Transaction timestamp="${getTimestamp()}"
             id="${generateId()}"
             partner="${PARTNER_KEY}">
  <PropertyDataSet action="delta">
    <Property>${hotelId}</Property>
    <RoomData>
      <RoomID>${roomId}</RoomID>
      <Name>
        <Text text="${name}" language="en"/>
      </Name>
      <Description>
        <Text text="${description}" language="en"/>
      </Description>
      <Capacity>${capacity.maxCapacity}</Capacity>
      <AdultCapacity>${capacity.adultCapacity}</AdultCapacity>
      ${capacity?.childCapacity && `<ChildCapacity>${capacity.childCapacity}</ChildCapacity>`}
      <OccupancySettings>
        <MinOccupancy>${capacity.minCapacity}</MinOccupancy>
        <MinAge>${capacity.minAge}</MinAge>
      </OccupancySettings>
      <RoomFeatures>
        <Beds>
        ${roomData.beds
          .map((bed) => {
            return `<Bed size="${
              bed === "Single"
                ? "single"
                : bed === "Semi Double"
                ? "semi_double"
                : bed === "Double"
                ? "double"
                : bed === "Queen"
                ? "queen"
                : "king"
            }"></Bed>`;
          })
          .join("")}
        </Beds>
        <MobilityAccessible/>
        <Smoking>${features.smoking ? "smoking" : "non_smoking"}</Smoking>
        <BathAndToilet relation="${washroom.relation === "Together" ? "together" : "separate"}">
          <Bath bathtub="${!washroom.bathTub ? "false" : "true"}" shower="${
    !washroom.shower ? "false" : "true"
  }"/>
          <Toilet electronic_bidet="${
            washroom.electronicBidet ? "true" : "false"
          }" mobility_accessible="${washroom.mobilityAccessible ? "true" : "false"}"/>
        </BathAndToilet>
        ${features.openAirBath ? `<OpenAirBath/>` : ``}
        ${features.airConditioning ? `<AirConditioning/>` : ``}
        ${features.balcony ? `<Balcony/>` : ``}
      </RoomFeatures>
    </RoomData>
  </PropertyDataSet>
</Transaction>
`;
};

const removeAllRooms = ({ hotelId = 10 }) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Transaction timestamp="${getTimestamp()}"
             id="${generateId()}"
             partner="${PARTNER_KEY}">
  <PropertyDataSet action="overlay">
    <Property>${hotelId}</Property>
  </PropertyDataSet>
</Transaction>
`;
};

const addInventory = ({ hotelId = 10, roomId, startDate, endDate, inventory }) => {
  return `<OTA_HotelInvCountNotifRQ xmlns="http://www.opentravel.org/OTA/2003/05"
                          EchoToken="${generateId()}"
                          TimeStamp="${getTimestamp()}"
                          Version="3.0">
  <POS>
    <Source>
      <RequestorID ID="${PARTNER_KEY}"/>
    </Source>
  </POS>
  <Inventories HotelCode="${hotelId}">
    <Inventory>
      <StatusApplicationControl Start="${startDate}"
                                End="${endDate}"
                                InvTypeCode="${roomId}"/>
      <InvCounts>
        <InvCount Count="${inventory}" CountType="2"/>
      </InvCounts>
    </Inventory>
  </Inventories>
</OTA_HotelInvCountNotifRQ>
`;
};

const addRate = ({
  hotelId = 10,
  startDate,
  endDate,
  roomId,
  currency = "INR",
  amountBeforeTax = 99,
  packageId,
}) => {
  console.log(amountBeforeTax);
  return `<?xml version="1.0" encoding="UTF-8"?>
<OTA_HotelRateAmountNotifRQ xmlns="http://www.opentravel.org/OTA/2003/05"
                            EchoToken="${generateId()}"
                            TimeStamp="${getTimestamp()}"
                            Version="3.0">
  <POS>
    <Source>
      <RequestorID ID="${PARTNER_KEY}"/>
    </Source>
  </POS>
  <RateAmountMessages HotelCode="${hotelId}">
    <RateAmountMessage>
      <StatusApplicationControl Start="${startDate}"
                                End="${endDate}"
                                InvTypeCode="${roomId}"
                                RatePlanCode="${packageId}"/>
      <Rates>
        <Rate>
          <BaseByGuestAmts>
            <BaseByGuestAmt AmountBeforeTax="${amountBeforeTax}"
                            CurrencyCode="${currency}"/>
          </BaseByGuestAmts>
        </Rate>
      </Rates>
    </RateAmountMessage>
  </RateAmountMessages>
</OTA_HotelRateAmountNotifRQ>
`;
};

const toggleAvailability = ({
  hotelId = 10,
  roomId,
  startDate,
  endDate,
  packageId,
  available = false,
}) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<OTA_HotelAvailNotifRQ xmlns="http://www.opentravel.org/OTA/2003/05"
                       EchoToken="${generateId()}"
                       TimeStamp="${getTimestamp()}"
                       Version="3.0">
  <POS>
    <Source>
      <RequestorID ID="${PARTNER_KEY}"/>
    </Source>
  </POS>
  <AvailStatusMessages HotelCode="${hotelId}">
    <AvailStatusMessage>
      <StatusApplicationControl Start="${startDate}"
                                End="${endDate}"
                                InvTypeCode="${roomId}"
                                RatePlanCode="${packageId}"/>
      <RestrictionStatus Status="${available ? "Open" : "Close"}" Restriction="Master"/>
    </AvailStatusMessage>
  </AvailStatusMessages>
</OTA_HotelAvailNotifRQ>
`;
};

const createPackage = ({ hotelId = 10, roomId, packageId, packageData, packages }) => {
  const {
    name,
    description,
    refundable,
    refundableUntilTime,
    internet,
    parking,
    meals,
    checkInTime,
    checkOutTime,
  } = packageData;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Transaction timestamp="${getTimestamp()}"
             id="${generateId()}"
             partner="${PARTNER_KEY}">
  <PropertyDataSet action="delta">
    <Property>${hotelId}</Property>
    <RoomData>
      <RoomID>${roomId}</RoomID>
      <AllowablePackageIDs>
       ${packages
         .map((_package) => {
           return `<AllowablePackageID>${_package}</AllowablePackageID>`;
         })
         .join("")}
        <AllowablePackageID>${packageId}</AllowablePackageID>
      </AllowablePackageIDs>
    </RoomData>
    <PackageData>
      <PackageID>${packageId}</PackageID>
      <Name>
        <Text text="${name}" language="en"/>
      </Name>
      <Description>
        <Text text="${description}" language="en"/>
      </Description>
      <AllowableRoomIDs>
        <AllowableRoomID>${roomId}</AllowableRoomID>
      </AllowableRoomIDs>
      ${
        !refundable
          ? `<Refundable available="false"  />`
          : `<Refundable available="true" refundable_until_time="${refundableUntilTime}" />`
      }
      <InternetIncluded>"${internet ? "true" : "false"}"</InternetIncluded>
      <ParkingIncluded>"${parking ? "true" : "false"}"</ParkingIncluded>
      <CheckinTime>"${checkInTime}"</CheckinTime>
      <CheckoutTime>"${checkOutTime}"</CheckoutTime>
      ${meals
        .map((meal) => {
          return meal === "Breakfast"
            ? `<Breakfast included="true" />`
            : meal === "Dinner"
            ? `<Dinner included="true" />`
            : ``;
        })
        .join("")}
    </PackageData>
  </PropertyDataSet>
</Transaction>
`;
};

const _updatePackage = ({ hotelId = 10, roomId, packageId, packageData }) => {
  const {
    name,
    description,
    refundable,
    refundableUntilTime,
    internet,
    parking,
    meals,
    checkInTime,
    checkOutTime,
  } = packageData;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Transaction timestamp="${getTimestamp()}"
             id="${generateId()}"
             partner="${PARTNER_KEY}">
  <PropertyDataSet action="delta">
    <Property>${hotelId}</Property>
    <RoomData>
      <RoomID>${roomId}</RoomID>
    </RoomData>
    <PackageData>
      <PackageID>${packageId}</PackageID>
      <Name>
        <Text text="${name}" language="en"/>
      </Name>
      <Description>
        <Text text="${description}" language="en"/>
      </Description>
      <AllowableRoomIDs>
        <AllowableRoomID>${roomId}</AllowableRoomID>
      </AllowableRoomIDs>
      ${
        !refundable
          ? `<Refundable available="false"  />`
          : `<Refundable available="true" refundable_until_time="${refundableUntilTime}" />`
      }
      <InternetIncluded>"${internet ? "true" : "false"}"</InternetIncluded>
      <ParkingIncluded>"${parking ? "true" : "false"}"</ParkingIncluded>
      <CheckinTime>"${checkInTime}"</CheckinTime>
      <CheckoutTime>"${checkOutTime}"</CheckoutTime>
      ${meals
        .map((meal) => {
          return meal === "Breakfast"
            ? `<Breakfast included="true" />`
            : meal === "Dinner"
            ? `<Dinner included="true" />`
            : ``;
        })
        .join("")}
    </PackageData>
  </PropertyDataSet>
</Transaction>
`;
};

export {
  addRoom,
  addInventory,
  addRate,
  toggleAvailability,
  updateRoom,
  createPackage,
  _updatePackage,
};
