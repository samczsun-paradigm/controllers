import HttpProvider from 'ethjs-provider-http';
import nock from 'nock';
import { StaticWeb3Provider } from '../../../../StaticWeb3Provider';
import { ERC1155Standard } from './ERC1155Standard';

const MAINNET_PROVIDER_HTTP = new HttpProvider(
  'https://mainnet.infura.io/v3/341eacb578dd44a1a049cbc5f6fd4035',
);
const MAINNET_PROVIDER = new StaticWeb3Provider(MAINNET_PROVIDER_HTTP, 1);
const ERC1155_ADDRESS = '0xfaafdc07907ff5120a76b34b731b278c38d6043c';

describe('ERC1155Standard', () => {
  let erc1155Standard: ERC1155Standard;
  nock.disableNetConnect();

  beforeAll(() => {
    erc1155Standard = new ERC1155Standard(MAINNET_PROVIDER);
  });

  afterAll(() => {
    nock.restore();
  });

  it('should determine if contract supports URI metadata interface correctly', async () => {
    nock('https://mainnet.infura.io:443', { encodedQueryParams: true })
      .post('/v3/341eacb578dd44a1a049cbc5f6fd4035', {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [
          {
            to: ERC1155_ADDRESS,
            data: '0x01ffc9a70e89341c00000000000000000000000000000000000000000000000000000000',
          },
          'latest',
        ],
      })
      .reply(200, {
        jsonrpc: '2.0',
        id: 1,
        result:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
      });
    const contractSupportsUri =
      await erc1155Standard.contractSupportsURIMetadataInterface(
        ERC1155_ADDRESS,
      );
    expect(contractSupportsUri).toBe(true);
  });
});
