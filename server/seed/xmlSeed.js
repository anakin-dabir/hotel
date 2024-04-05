import generateId from "../utils/generateId.js";
import getTimestamp from "../utils/getTimestamp.js";

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

const addRoom = ({
  hotelId = 10,
  roomId,
  name,
  capacity,
  packageId,
  packageName,
  packageId2,
  packageName2,
}) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Transaction timestamp="${getTimestamp()}"
             id="${generateId()}"
             partner="${PARTNER_KEY}">
  <PropertyDataSet action="overlay">
    <Property>${hotelId}</Property>
    <RoomData>
      <RoomID>${roomId}</RoomID>
      <Name>
        <Text text="${name}" language="en"/>
      </Name>
      <Capacity>4</Capacity>
      <AdultCapacity>4</AdultCapacity>
      <ChildCapacity>3</ChildCapacity>
       <AllowablePackageIDs>
        <AllowablePackageID>${packageId}</AllowablePackageID>
        <AllowablePackageID>${packageId2}</AllowablePackageID>
      </AllowablePackageIDs>
    </RoomData>
     <PackageData>
      <PackageID>${packageId}</PackageID>
      <Name>
        <Text text="${packageName}" language="en"/>
      </Name>
    </PackageData>
     <PackageData>
      <PackageID>${packageId2}</PackageID>
      <Name>
        <Text text="${packageName2}" language="en"/>
      </Name>
      <ParkingIncluded>true</ParkingIncluded>
    </PackageData>
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
                          EchoToken="${generateId}"
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

export { addRoom, addInventory, addRate, toggleAvailability };
