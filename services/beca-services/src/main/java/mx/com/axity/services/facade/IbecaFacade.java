package mx.com.axity.services.facade;

import mx.com.axity.commons.to.ContactTO;

import java.util.List;

public interface IbecaFacade {

    List<ContactTO> getContactF(String name);
    List<ContactTO> getContactBYNameLastname(String name, String lastName);


    //List<ContactTO> getContactNameAndLastNameQ(String name, String lastName);
}
