//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


//PRESALE


contract SimpleNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDCounter;

    string _name;
    string _symbol;
    address _owner;
    uint256 _price;
    bool public publicSaleStarted;
    //uint256 public presaleEnded;

    mapping(address => uint256) private _balances;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => address) private _tokenOwners;
    mapping(string => address) private _URIOwners;
    //whitelistedAddress?
    //mapping, array, events, merke tree
    mapping (address => bool) public whitelistedAddresses; //public generated automatic getter Function

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {
        _name = name_;
        _symbol = symbol_;
        _owner = msg.sender;
        _price = 2 * 10 ** 16;
    }

    function addAddressToWhitelist(address[] memory arrayOfAddress) public onlyOwner{
        for (uint i=0; i<arrayOfAddress.length; i++) 
        {
            whitelistedAddresses[arrayOfAddress[i]] = true;
        }
    }

    function presaleMint(string memory tokenURI_) public payable virtual {
        require(whitelistedAddresses[msg.sender] == true);
        require(msg.value >= _price, "Not enough balance");
        _tokenIDCounter.increment();
        uint256 _tokenID = _tokenIDCounter.current();
        _safeMint(msg.sender, _tokenID);
        _tokenOwners[_tokenID] = msg.sender;
        _URIOwners[tokenURI_] = msg.sender;
         _setTokenURI(_tokenID, tokenURI_);
        _balances[msg.sender]++;
        //presaleEnded = block.timestamp + 3 minutes;
    }
    function startPublicSale() public onlyOwner{
        publicSaleStarted = true;
    }

    // accepts token URI + payment
    function mint(string memory tokenURI_) public payable virtual {

        require(publicSaleStarted, "Public has not ended yet");
        require(msg.value >= _price, "Not enough balance");
        _tokenIDCounter.increment();
        uint256 _tokenID = _tokenIDCounter.current();

        _safeMint(msg.sender, _tokenID);
        _tokenOwners[_tokenID] = msg.sender;
        _URIOwners[tokenURI_] = msg.sender;
        _setTokenURI(_tokenID, tokenURI_);
        _balances[msg.sender]++;
    }

    //update token
    function updateTokenURI(
        uint256 tokenID_,
        string memory _newTokenURI
    ) public payable virtual {
        require(msg.sender == _tokenOwners[tokenID_], "You are impostor");
        require(msg.value >= _price, "Not enough balance");
        _setTokenURI(tokenID_, _newTokenURI);
    }

    function _setTokenURI(
        uint256 tokenID_,
        string memory newtokenURI_
    ) internal virtual {
        require(_exists(tokenID_), "URI set nonexistent token");
        _tokenURIs[tokenID_] = newtokenURI_;
    }

    function tokenURI(
        uint256 tokenID
    ) public view override returns (string memory) {
        return _tokenURIs[tokenID];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIDCounter.current();
    }

    function setPrice(uint256 price_) public virtual onlyOwner {
        _price = price_;
    }

    function price() public view virtual returns (uint256) {
        return _price;
    }

    function withdraw() public payable onlyOwner {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success);
    }
}
