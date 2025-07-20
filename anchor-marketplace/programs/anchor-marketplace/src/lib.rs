#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

mod instructions;
mod state;
mod error;

use instructions::*;

declare_id!("62qSrYVrge3jBdtAVbwQxFuRxKDLsGUNke1bTEf3nFiQ");

#[program]
pub mod anchor_marketplace {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>,fee: u8, name: String ) -> Result<()> {
        ctx.accounts.init(
            fee,
            name,
            &ctx.bumps
        )?;
        Ok(())
    }

    // pub fn listing(ctx: Context<List>, price: u64 ) -> Result<()> {
    //     ctx.accounts.create_listing(
    //        price,
    //         &ctx.bumps
    //     )?;
    //     ctx.accounts.list_nft()?;
    //     Ok(())
    // }

    // pub fn delisting(ctx: Context<Delist> ) -> Result<()> {
    //     ctx.accounts.delist_nft()?;
    //     Ok(())
    // }

    // pub fn purchase(ctx: Context<Purchase> ) -> Result<()> {
    //     ctx.accounts.pay()?;
    //     ctx.accounts.transfer_nft()?;
    //     Ok(())
    // }
}
