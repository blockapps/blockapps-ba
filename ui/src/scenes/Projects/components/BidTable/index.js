import React, {Component} from 'react';
import { connect } from 'react-redux';
import { fetchProjectBids } from './actions/projectBids.actions';
import { acceptBid } from './actions/acceptBid.actions';
import Button from 'react-md/lib/Buttons/Button';
import DataTable from 'react-md/lib/DataTables/DataTable';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TableRow from 'react-md/lib/DataTables/TableRow';
import TableColumn from 'react-md/lib/DataTables/TableColumn';
import { FormattedNumber } from 'react-intl';

class BidTable extends Component {
  componentWillMount(){
    this.props.fetchProjectBids(this.props.name);
  }

  // TODO: move to common place
  get isBuyer() {
    return this.props.login['role'] === 'BUYER'
  }

  handleBidAcceptClick = function(e, bid) {
    e.stopPropagation();
    this.props.acceptBid(bid.name, bid.id);
  };

  render() {
    const bids = this.props.bids;
    const bidRows = bids.map(
      (bid,i) =>
        <TableRow key={"bid"+i}>
          <TableColumn>
            <FormattedNumber
              value={bid.amount}
              style="currency" //eslint-disable-line
              currency="USD" />
          </TableColumn>
          <TableColumn>
            <span style={{whiteSpace: "normal"}}>
            {bid.supplier}
          </span>
          </TableColumn>
          <TableColumn>
            {
              this.props['projectState'] === 'OPEN' && this.isBuyer
                ? <Button
                primary
                flat
                label="Accept"
                onClick={
                  (e) => this.handleBidAcceptClick(e, bid)
                }
              >check_circle</Button>
                : ''
            }
          </TableColumn>
        </TableRow>
      );

      return (
        <DataTable plain>
          <TableHeader>
            <TableRow
              // autoAdjust={false}
            >
              <TableColumn>Bid</TableColumn>
              <TableColumn>Supplier</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bidRows}
          </TableBody>
        </DataTable>
      );
  }
}

function mapStateToProps(state) {
  return {
    login: state.login,
    bids: state.bids.bids
  };
}
export default connect(mapStateToProps, { fetchProjectBids, acceptBid })(BidTable);
