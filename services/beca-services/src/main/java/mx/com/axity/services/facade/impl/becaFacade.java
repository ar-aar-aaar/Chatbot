package mx.com.axity.services.facade.impl;

import mx.com.axity.commons.to.ContactTO;
import mx.com.axity.commons.to.UserTO;
import mx.com.axity.model.ContactDO;
import mx.com.axity.services.facade.IbecaFacade;
import mx.com.axity.services.service.IbecaService;
import mx.com.axity.services.service.impl.becaServiceImpl;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class becaFacade implements IbecaFacade {

    static final Logger LOG = LogManager.getLogger(becaServiceImpl.class);
    @Autowired
    private IbecaService becaService;

    @Autowired
    ModelMapper modelMapper;

    @Override
    public ContactTO getContactF(String name) {
        ContactDO contact = this.becaService.getContact(name);
        LOG.info("----------->>>>>>>>>>>>>" + contact.getId_myaxity());
        ContactTO contactTO = this.modelMapper.map(contact, ContactTO.class);
        LOG.info("----------->>>>>>>>>>>>>" + contactTO.getId_myaxity());
        return contactTO;
    }
}
