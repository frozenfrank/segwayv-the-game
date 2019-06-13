function MailChimp16(){
    return updateSome(new userObject, {
        name: 'MailChimp16',
        appearance: {
            shape: ['v2.1',{
                src:'assets/images/sprites/' +
                    'promoCode-mailchimp16.png',
            }],
            displayName: 'Mail Chimp Promo',
        },
        gamePlay: {
            maxHP: 2700,
            resizeSpeed: 17,
            rotateSpeed: 6.5,
            shieldRegen: 3,
            shieldBurnOut: 90,
            maxShields: 3500,
            speed: 14,
            damageMultiplier: 2.5,
            weaponKeywords: ['Sword','LittleSister'],
        },
        physics: {
            mass: 100,
        },
        user: {
            availableToPublic: false,
        },
    });
}