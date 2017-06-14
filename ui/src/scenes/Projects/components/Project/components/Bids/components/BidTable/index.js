import React, {Component} from 'react';
import { connect } from 'react-redux';
import { acceptBid } from './actions/acceptBid.actions';
import Avatar from 'react-md/lib/Avatars';
import Button from 'react-md/lib/Buttons/Button';
import Chip from 'react-md/lib/Chips';
import DataTable from 'react-md/lib/DataTables/DataTable';
import FontIcon from 'react-md/lib/FontIcons';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TableRow from 'react-md/lib/DataTables/TableRow';
import TableColumn from 'react-md/lib/DataTables/TableColumn';
import { FormattedNumber } from 'react-intl';
import {ROLES, STATES, BID_STATES} from '../../../../../../../../constants';
//import './BidTable.css';

class BidTable extends Component {

  // TODO: move to common place
  get isBuyer() {
    return parseInt(this.props.login['role']) === ROLES.BUYER
  }

  handleBidAcceptClick = function(e, bid) {
    e.stopPropagation();
    this.props.acceptBid(this.props.login.username, bid.name, bid.id);
  };

  render() {
    const bids = this.props.bids;
    bids.sort(function(a, b){
      return a.amount-b.amount;
    });
    console.log("BIDS >>>>>" , bids);
    const bidRows = bids.length !== 0 ? bids.map(
      (bid,i) =>
        <TableRow key={"bid"+i}>
          <TableColumn>
            {
              parseInt(this.props['projectState']) === STATES.OPEN && this.isBuyer
                ?
                  <Button
                    flat
                    label="Accept bid"
                    onClick={
                      (e) => this.handleBidAcceptClick(e, bid)
                    }
                  >gavel</Button>
                :
                  (BID_STATES[parseInt(bid.state)] === 'ACCEPTED')
                  ?
                    <Chip
                      label="ACCEPTED"
                      avatar={<Avatar icon={<FontIcon>check</FontIcon>}/>}
                    />
                  :
                    ''

            }
          </TableColumn>

          <TableColumn >
            <span className="md-subheading-2">
              {bid.supplier}
            </span>
          </TableColumn>
          <TableColumn numeric={true}>
            <span className="md-subheading-2">
              <FormattedNumber
                value={bid.amount}
                style="currency" //eslint-disable-line
                currency="USD" />
              </span>
          </TableColumn>
        </TableRow>
      )
      :
      <TableRow>
        <TableColumn />
        <TableColumn>
          <i> No bids to show! </i>
        </TableColumn>
      </TableRow>;

      return (
        <DataTable plain>
          <TableHeader>
            <TableRow
              autoAdjust={false}
            >
              <TableColumn header={true}></TableColumn>
              <TableColumn header={true}>Supplier</TableColumn>
              <TableColumn header={true} numeric={true}>Bid</TableColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bidRows}
          </TableBody>
        </DataTable>
      )
  }
}

function mapStateToProps(state) {
  return {
    login: state.login
  };
}
export default connect(mapStateToProps, { acceptBid })(BidTable);
