
export const ROLES = {
  BUYER:'BUYER',
  SUPPLIER: 'SUPPLIER'
}

export const USER_ROLES = {
  NULL: 0,
  ADMIN: 1,
  BUYER: 2,
  SUPPLIER: 3,
}

export const STATES = {
  OPEN: {
    state: 'OPEN',
    icon: 'visibility'
  },
  PRODUCTION: {
    state: 'PRODUCTION',
    icon: 'build'
  },
  INTRANSIT: {
    state: 'INTRANSIT',
    icon: 'flight_takeoff'
  },
  RECEIVED: {
    state: 'RECEIVED',
    icon: 'mood'
  }
}

export const PROJECT_EVENTS = ['NULL', 'Accepted', 'Shipped', 'Received']
