import React, {Component} from 'react';
import { connect } from 'react-redux';
import { fetchProjectBids } from './bidTable.actions';
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
            {/*todo: show accept buttons only if no accepted bid yet*/}
            {/*{ project.accepted ?*/}
            {/*<span>*/}
            {/*<h2>{ `Welcome Back ${ this.props.name }` }</h2>*/}
            {/*<p>You can visit settings to reset your password</p>*/}
            {/*</span>*/}
            {/*:*/}
            {/*null*/}
            {/*}*/}
            <span style={{whiteSpace: "normal"}}>
            {bid.supplier}
          </span>
          </TableColumn>
          <TableColumn>
            <Button primary flat label="Accept">check_circle</Button> {/*todo: onClick= accept bid*/}
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
  };
}

export default connect(mapStateToProps, { fetchProjectBids })(BidTable);
