import { gql } from '@apollo/client';

export const GET_CLIENT_VARIANTS = gql`
  query getClientVariants(
    $limit: Int
    $offset: Int
    $ordering: [String]
    $filters: ClientVariantFilterInput
  ) {
    clientVariants(limit: $limit, offset: $offset, ordering: $ordering, filters: $filters) {
      items {
        id
        price
        conditionGrade
        color {
          colorCode
          englishName
          persianName
        }
        coverImage {
          caption
          id
          imageUrl
          isCover
          order
        }

        productConfiguration {
          id
          partNumber
          ram
          simCount
          storage
          product {
            id
            imageCover
            name
            persianName
            releaseDate
            brand {
              id
              logo
              persianName
              name
            }
          }
        }
      }
      total
    }
  }
`;
export const GET_CLIENT_VARIANT = gql`
  query getClientVariant($variantId: ID!) {
    clientVariant(variantId: $variantId) {
      id
      price
      conditionGrade
      attachments {
        attachmentUrl
        caption
        id
        order
      }
      color {
        colorCode
        englishName
        persianName
      }

      images {
        caption
        id
        imageUrl
        isCover
        order
      }
      productConfiguration {
        id
        partNumber
        ram
        simCount
        storage
        product {
          id
          imageCover
          name
          persianName
          releaseDate
          brand {
            id
            logo
            persianName
            name
          }
        }
      }
      qcs {
        currentStatus
        id
        answers {
          id
          image
          value
          selectedOptions {
            id
            value
          }
          title {
            id
            name
            slug
          }
        }
      }
    }
  }
`;
export const GET_MY_PARTNER_PROFILE = gql`
  query getMyPartnerProfile {
    myPartnerProfile {
      id
      activityCity {
        id
        name
        province {
          id
          name
        }
      }
      isActive
      status
      name
      address
      customer {
        id
        user {
          id
          firstName
          lastName
          email
          mobile
          isActive
          nationalId
        }
      }
    }
  }
`;
export const GET_CLIENT_PROVINCES = gql`
  query getClientProvinces(
    $limit: Int
    $offset: Int
    $filters: ClientProvinceFilterInput
    $ordering: [String]
  ) {
    clientProvinces(limit: $limit, offset: $offset, ordering: $ordering, filters: $filters) {
      items {
        id
        name
      }
      total
    }
  }
`;
export const GET_CLIENT_CITIES = gql`
  query getClientCities(
    $limit: Int
    $offset: Int
    $ordering: [String]
    $filters: ClientCityFilterInput
  ) {
    clientCities(limit: $limit, offset: $offset, ordering: $ordering, filters: $filters) {
      items {
        id
        name
      }
      total
    }
  }
`;
export const GET_CLIENT_CART = gql`
  query clientCart {
    clientCart {
      items {
        isAvailable
        quantity
        variantUnitPrice
        variant {
          id
          coverImage {
            imageUrl
          }
        }
      }
      totalPrice
    }
  }
`;
export const GET_CLIENT_DETAILED_CART = gql`
  query clientCart {
    clientCart {
      items {
        isAvailable
        quantity
        variantUnitPrice
        variant {
          id
          price
          conditionGrade
          color {
            colorCode
            englishName
            persianName
          }
          coverImage {
            caption
            id
            imageUrl
            isCover
            order
          }
          productConfiguration {
            id
            partNumber
            ram
            simCount
            storage
            product {
              id
              imageCover
              name
              persianName
              releaseDate
              brand {
                id
                logo
                persianName
                name
              }
            }
          }
          qcs {
            currentStatus
            id
            answers {
              id
              image
              value
              selectedOptions {
                id
                value
              }
              title {
                id
                name
                slug
              }
            }
          }
        }
      }
      totalPrice
    }
  }
`;
export const GET_CLIENT_EXCHANGE = gql`
  query GetClientExchange($exchangeId: ID!) {
    clientExchange(exchangeId: $exchangeId) {
      finalUsedPrice
      status
      usedDeviceConfig {
        product {
          name
          brand {
            name
          }
        }
        ram
        simCount
        storage
        partNumber
      }
      qcs {
        id
        currentStatus
        answers {
          selectedOptions {
            id
            value
          }
          title {
            name
          }
        }
      }
    }
  }
`;
export const GET_CLIENT_BRANDS = gql`
  query getClientBrands($limit: Int, $offset: Int, $filters: ClientBrandFilterInput) {
    clientBrands(limit: $limit, offset: $offset, filters: $filters) {
      items {
        id
        persianName
      }
    }
  }
`;
export const GET_CLIENT_PRODUCTS = gql`
  query getClientProducts($limit: Int, $offset: Int, $filters: ClientProductFilterInput) {
    clientProducts(limit: $limit, offset: $offset, filters: $filters) {
      items {
        id
        name
      }
    }
  }
`;
export const GET_CLIENT_ADDRESSES = gql`
  query getClientAddresses {
    clientAddresses {
      addressDetail
      id
      number
      phoneNumber
      postalCode
      title
      unit
      firstName
      lastName
      city {
        id
        name
        province {
          id
          name
        }
      }
    }
  }
`;
export const GET_CLIENT_ADDRESS = gql`
  query getClientAddress($addressId: ID!) {
    clientAddress(addressId: $addressId) {
      addressDetail
      id
      number
      phoneNumber
      postalCode
      title
      unit
      firstName
      lastName
      city {
        id
        name
        province {
          id
          name
        }
      }
    }
  }
`;
export const GET_CLIENT_DELIVERY_METHODS = gql`
  query getClientDeliveryMethods {
    clientDeliveryMethods {
      id
      name
      description
      deliveryType
      logoUrl
      price
    }
  }
`;
export const GET_MY_PAYMENT = gql`
  query getMyPayment($paymentId: ID!) {
    myPayment(paymentId: $paymentId) {
      amount
      status
      invoice {
        id
        objectId
      }
    }
  }
`;
export const GET_MY_ORDER = gql`
  query getMyOrder($orderId: ID!) {
    myOrder(orderId: $orderId) {
      id
      addressSnapshot
      finalPrice
      status
      deliveryTitle
      createdAt
      shippingPrice
      invoice {
        id
        status
      }
      details {
        id
        unitFinalPrice
        variantName
        variant {
          id
          price
          conditionGrade
          coverImage {
            imageUrl
          }
          attachments {
            attachmentUrl
            caption
            id
            order
          }
          color {
            colorCode
            englishName
            persianName
          }

          images {
            caption
            id
            imageUrl
            isCover
            order
          }
          qcs {
            currentStatus
            id
            answers {
              id
              image
              value
              selectedOptions {
                id
                value
              }
              title {
                id
                name
                slug
              }
            }
          }
          productConfiguration {
            id
            partNumber
            ram
            simCount
            storage
            product {
              id
              imageCover
              name
              persianName
              releaseDate
              brand {
                id
                logo
                persianName
                name
              }
            }
          }
        }
      }
    }
  }
`;
export const GET_MY_ORDERS = gql`
  query getMyOrders(
    $limit: Int
    $offset: Int
    $ordering: [String]
    $filters: ClientOrderFilterInput
  ) {
    myOrders(limit: $limit, offset: $offset, ordering: $ordering, filters: $filters) {
      items {
        id
        status
        deliveryTitle
        finalPrice
        createdAt
        invoice {
          id
          status
        }
        details {
          variant {
            coverImage {
              imageUrl
            }
          }
        }
      }
    }
  }
`;
export const GET_MY_ORDERS_STATUS_COUNTS = gql`
  query getMyOrdersStatusCounts(
    $inProgress: ClientOrderFilterInput
    $delivered: ClientOrderFilterInput
    $cancelled: ClientOrderFilterInput
  ) {
    inProgress: myOrders(limit: 0, offset: 0, filters: $inProgress) {
      total
    }
    delivered: myOrders(limit: 0, offset: 0, filters: $delivered) {
      total
    }
    cancelled: myOrders(limit: 0, offset: 0, filters: $cancelled) {
      total
    }
  }
`;
