
import { Form } from '../../public/js/src/module/Form';
import forms from './forms/forms';
import chai from 'chai';
const expect = chai.expect;

const loadForm = filename => {
    const strings = forms[ filename ];

    return new Form( strings.html_form, {
        modelStr: strings.xml_model
    } );
};

describe( 'Customized Branching Logic', () => {
    const a = '[name="/data/something"]';
    const b = '[name="/data/rep/val"]';
    const c = '[name="/data/rep/skipq"]';
    const r = '[name="/data/rep"]';

    describe( 'for individual questions', () => {

        describe( 'disabled class', () => {
            let form;

            beforeEach( () => {
                form = loadForm( 'relevant_constraint_required.xml' );
                form.init();
                form.view.$.find( a ).val( 'a' ).trigger( 'change' );
                form.view.$.find( b ).val( 'diarrhea' ).trigger( 'change' );
            } );

            // Test if we haven't messed up Enketo Core's default functionality
            it( 'is still added if value is empty', () => {
                // not disabled
                expect( form.view.$.find( c ).closest( '.question' ).hasClass( 'disabled' ) ).to.equal( false );
                // make c irrelevant
                form.view.$.find( b ).val( 'd' ).trigger( 'change' );
                // check if disabled
                expect( form.view.$.find( c ).closest( '.question' ).hasClass( 'disabled' ) ).to.equal( true );
            } );

            // Test OC-custom functionality
            it( 'is not added if value is non-empty (1)', () => {
                // add value to c
                form.view.$.find( c ).val( 5 ).trigger( 'change' );
                // not disabled
                expect( form.view.$.find( c ).closest( '.question' ).hasClass( 'disabled' ) ).to.equal( false );
                // make c irrelevant
                form.view.$.find( b ).val( 'd' ).trigger( 'change' );
                // check if disabled
                expect( form.view.$.find( c ).closest( '.question' ).hasClass( 'disabled' ) ).to.equal( false ); // FALSE!
            } );

            // Test OC-custom functionality
            it( 'is not added if value is non-empty (2)', () => {
                // add value to c
                form.view.$.find( a ).val( 'nothing' ).trigger( 'change' );
                // check if disabled
                expect( form.view.$.find( c ).closest( '.question' ).hasClass( 'disabled' ) ).to.equal( false ); // FALSE!
            } );

        } );

        describe( 'with relevant error', () => {
            let form;

            beforeEach( () => {
                form = loadForm( 'relevant_constraint_required.xml' );
                form.init();
                form.view.$.find( a ).val( 'a' ).trigger( 'change' );
                form.view.$.find( b ).val( 'diarrhea' ).trigger( 'change' );
                // add value to c
                form.view.$.find( c ).val( 5 ).trigger( 'change' );
                // make c irrelevant
                form.view.$.find( b ).val( 'd' ).trigger( 'change' );
            } );

            it( 'shown to alert user that value is non-empty (1)', () => {
                expect( form.view.$.find( c ).closest( '.question' ).hasClass( 'invalid-relevant' ) ).to.equal( true );
            } );

            it( 'shown to alert user that value is non-empty (2)', () => {
                form.view.$.find( a ).val( 'nothing' ).trigger( 'change' );
                expect( form.view.$.find( b ).closest( '.question' ).hasClass( 'invalid-relevant' ) ).to.equal( true );
            } );

            it( 'removed if value changes from non-empty to empty', () => {
                // remove value for c
                form.view.$.find( c ).val( '' ).trigger( 'change' );
                expect( form.view.$.find( c ).closest( '.question' ).hasClass( 'invalid-relevant' ) ).to.equal( false );
            } );
        } );


        describe( 'with relevant error interacting with constraint error', () => {
            let form;

            beforeEach( done => {
                form = loadForm( 'relevant_constraint_required.xml' );
                form.init();
                form.view.$.find( a ).val( 'afdgsgsfafdfadssf' ).trigger( 'change' );
                form.view.$.find( b ).val( 'diarrhea' ).trigger( 'change' );
                // add value to c that fails constraint
                form.view.$.find( c ).val( 5 ).trigger( 'change' );
                // make c irrelevant (and still failing constraint validation too)
                form.view.$.find( b ).val( 'diarrheadafsdsfdasd' ).trigger( 'change' );
                setTimeout( () => {
                    done();
                }, 500 );
            } );

            it( 'shows relevant error but not constraint error when form.validate() is called', () => form.validate()
                .then( result => Promise.all( [
                    expect( result ).to.equal( false ),
                    expect( form.view.$.find( c ).closest( '.question' ).hasClass( 'invalid-relevant' ) ).to.equal( true ),
                    expect( form.view.$.find( c ).closest( '.question' ).hasClass( 'invalid-constraint' ) ).to.equal( false ),
                ] ) ) );

        } );

        describe( 'resets relevantError', () => {
            let form;

            beforeEach( done => {
                form = loadForm( 'relevant_constraint_required.xml' );
                form.init();
                form.view.$.find( a ).val( 'a' ).trigger( 'change' );
                form.view.$.find( b ).val( 'd' ).trigger( 'change' );
                // make b irrelevant
                form.view.$.find( a ).val( 'nothing' ).trigger( 'change' );
                setTimeout( () => {
                    done();
                }, 500 );
            } );

            it( 'when question becomes relevant again', () => {
                expect( form.view.$.find( b ).closest( '.question' ).hasClass( 'invalid-relevant' ) ).to.equal( true );
                // make b relevant again
                form.view.$.find( a ).val( 'a' ).trigger( 'change' );
                expect( form.view.$.find( c ).closest( '.question' ).hasClass( 'invalid-relevant' ) ).to.equal( false );
            } );
        } );

    } );


    describe( 'for groups', () => {

        describe( 'disabled class', () => {
            let form;

            beforeEach( () => {
                form = loadForm( 'relevant_group.xml' );
                form.init();
                form.view.$.find( a ).val( 'a' ).trigger( 'change' );
            } );

            // Test if we haven't messed up Enketo Core's default functionality
            it( 'is still added if value is empty', () => {
                // r not disabled
                expect( form.view.$.find( r ).hasClass( 'disabled' ) ).to.equal( false );
                // make r irrelevant (no values inside repeat)
                form.view.$.find( a ).val( '' ).trigger( 'change' );
                // r now disabled
                expect( form.view.$.find( r ).hasClass( 'disabled' ) ).to.equal( true );
            } );

            // Test OC-custom functionality
            it( 'is not added if a user-entered value inside group is non-empty', () => {
                // add value inside repeat
                form.view.$.find( b ).val( 'diarrhea' ).trigger( 'change' );
                // make r irrelevant (while it contains value)
                form.view.$.find( a ).val( '' ).trigger( 'change' );
                // r not disabled
                expect( form.view.$.find( r ).hasClass( 'disabled' ) ).to.equal( false ); // FALSE!
            } );

            // Test OC-custom functionality
            it( 'is not added if multiple user-entered values are non-emptys', () => {
                // add value to b
                form.view.$.find( b ).val( 'diarrhea' ).trigger( 'change' );
                // add value to c
                form.view.$.find( c ).val( '4' ).trigger( 'change' );
                // check if disabled
                expect( form.view.$.find( r ).hasClass( 'disabled' ) ).to.equal( false ); // FALSE!
            } );

        } );

        describe( 'with relevant error', () => {
            let form;

            beforeEach( () => {
                form = loadForm( 'relevant_group.xml' );
                form.init();
                form.view.$.find( a ).val( 'a' ).trigger( 'change' );
                form.view.$.find( b ).val( 'diarrhea' ).trigger( 'change' );
                // add value to c
                form.view.$.find( c ).val( 5 ).trigger( 'change' );
                // make r irrelevant
                form.view.$.find( a ).val( '' ).trigger( 'change' );
            } );

            it( 'shown to alert user that a user-entered value is non-empty', () => {
                expect( form.view.$.find( r ).hasClass( 'invalid-relevant' ) ).to.equal( true );
            } );

            it( 'removed if group becomes relevant again', () => {
                // remove one value
                form.view.$.find( a ).val( 'a' ).trigger( 'change' );
                expect( form.view.$.find( r ).hasClass( 'invalid-relevant' ) ).to.equal( false );
            } );

            it( 'removed when all user-entered values have changed from non-empty to empty', () => {
                // remove one value
                form.view.$.find( c ).val( '' ).trigger( 'change' );
                expect( form.view.$.find( r ).hasClass( 'invalid-relevant' ) ).to.equal( true );
                // remove remaining value
                form.view.$.find( b ).val( '' ).trigger( 'change' );
                expect( form.view.$.find( r ).hasClass( 'invalid-relevant' ) ).to.equal( false );
            } );

        } );

    } );
} );
